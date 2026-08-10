#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { inflateRawSync } from "node:zlib";

const args = new Set(process.argv.slice(2));
const allowedArgs = new Set(["--json", "--strict", "--self-test"]);
const unknownArgs = [...args].filter((arg) => !allowedArgs.has(arg));
const defaultDeckPath = "outputs/SCRIMED_Strategic_Investor_Deck.pptx";
const maximumArchiveBytes = 16 * 1024 * 1024;
const maximumEntryBytes = 2 * 1024 * 1024;
const maximumTotalSlideXmlBytes = 32 * 1024 * 1024;
const maximumZipEntries = 2048;

if (unknownArgs.length > 0) {
  throw new Error(`Unsupported investor deck review option: ${unknownArgs.join(", ")}`);
}

const forbiddenClaimPatterns = [
  { id: "hipaa-certified", pattern: /\bhipaa[ -]certified\b/i },
  { id: "soc2-certified", pattern: /\bsoc\s*2[ -]certified\b/i },
  { id: "hitrust-certified", pattern: /\bhitrust[ -]certified\b/i },
  { id: "fda-cleared", pattern: /\bfda[ -](?:cleared|approved)\b/i },
  { id: "clinical-validation-complete", pattern: /\bclinically validated\b|\bclinical validation (?:is )?complete\b/i },
  { id: "autonomous-clinical-authority", pattern: /\bautonomous (?:diagnosis|treatment|prescribing|clinical care)\b/i },
  { id: "doctor-replacement", pattern: /\breplaces? (?:doctors?|clinicians?|physicians?)\b/i },
  { id: "guaranteed-commercial-outcome", pattern: /\bguaranteed (?:approval|revenue|savings|reimbursement|return|roi)\b/i },
  { id: "openai-relationship-claim", pattern: /\b(?:openai partner|partnered with openai|backed by openai|endorsed by openai)\b/i }
];

const requiredBoundaryPatterns = [
  { id: "internal-draft", pattern: /\binternal preparation draft\b/i },
  { id: "no-phi", pattern: /\bno-phi\b/i },
  { id: "human-review", pattern: /\bhuman (?:approval|review)\b/i },
  { id: "relationship-disclaimer", pattern: /\bno relationship, endorsement, partnership\b/i },
  { id: "external-release-control", pattern: /\bexternal release requires\b/i },
  { id: "no-payer-submission", pattern: /\bno submission\b/i }
];

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function isSha256(value) {
  return typeof value === "string" && /^[0-9a-f]{64}$/i.test(value);
}

function decodeXmlText(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#([0-9]+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function extractDrawingText(xml) {
  return [...xml.matchAll(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g)]
    .map((match) => decodeXmlText(match[1]))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function findEndOfCentralDirectory(archive) {
  const minimumOffset = Math.max(0, archive.length - 65_557);
  for (let offset = archive.length - 22; offset >= minimumOffset; offset -= 1) {
    if (archive.readUInt32LE(offset) === 0x06054b50) return offset;
  }
  throw new Error("PowerPoint archive is missing a valid ZIP directory.");
}

function readZipEntries(archive) {
  if (!Buffer.isBuffer(archive) || archive.length < 22 || archive.length > maximumArchiveBytes) {
    throw new Error("PowerPoint archive size is outside the allowed review boundary.");
  }

  const eocdOffset = findEndOfCentralDirectory(archive);
  const totalEntries = archive.readUInt16LE(eocdOffset + 10);
  const centralDirectorySize = archive.readUInt32LE(eocdOffset + 12);
  const centralDirectoryOffset = archive.readUInt32LE(eocdOffset + 16);

  if (
    totalEntries > maximumZipEntries
    || centralDirectoryOffset + centralDirectorySize > archive.length
  ) {
    throw new Error("PowerPoint archive directory is invalid or exceeds review limits.");
  }

  const entries = [];
  let offset = centralDirectoryOffset;

  for (let index = 0; index < totalEntries; index += 1) {
    if (offset + 46 > archive.length || archive.readUInt32LE(offset) !== 0x02014b50) {
      throw new Error("PowerPoint archive contains an invalid central-directory entry.");
    }

    const flags = archive.readUInt16LE(offset + 8);
    const compressionMethod = archive.readUInt16LE(offset + 10);
    const compressedSize = archive.readUInt32LE(offset + 20);
    const uncompressedSize = archive.readUInt32LE(offset + 24);
    const nameLength = archive.readUInt16LE(offset + 28);
    const extraLength = archive.readUInt16LE(offset + 30);
    const commentLength = archive.readUInt16LE(offset + 32);
    const localHeaderOffset = archive.readUInt32LE(offset + 42);
    const nameStart = offset + 46;
    const nameEnd = nameStart + nameLength;

    if (nameEnd + extraLength + commentLength > archive.length) {
      throw new Error("PowerPoint archive contains a truncated entry name.");
    }

    entries.push({
      name: archive.toString("utf8", nameStart, nameEnd),
      flags,
      compressionMethod,
      compressedSize,
      uncompressedSize,
      localHeaderOffset
    });
    offset = nameEnd + extraLength + commentLength;
  }

  return entries;
}

function readEntryData(archive, entry) {
  if ((entry.flags & 0x1) !== 0) {
    throw new Error("Encrypted PowerPoint entries are not accepted for automated review.");
  }
  if (entry.uncompressedSize > maximumEntryBytes || entry.compressedSize > maximumEntryBytes) {
    throw new Error("PowerPoint slide entry exceeds automated review limits.");
  }

  const offset = entry.localHeaderOffset;
  if (offset + 30 > archive.length || archive.readUInt32LE(offset) !== 0x04034b50) {
    throw new Error("PowerPoint archive contains an invalid local entry header.");
  }

  const nameLength = archive.readUInt16LE(offset + 26);
  const extraLength = archive.readUInt16LE(offset + 28);
  const dataStart = offset + 30 + nameLength + extraLength;
  const dataEnd = dataStart + entry.compressedSize;
  if (dataEnd > archive.length) {
    throw new Error("PowerPoint archive contains truncated slide data.");
  }

  const compressed = archive.subarray(dataStart, dataEnd);
  let output;
  if (entry.compressionMethod === 0) {
    output = compressed;
  } else if (entry.compressionMethod === 8) {
    output = inflateRawSync(compressed, { maxOutputLength: maximumEntryBytes });
  } else {
    throw new Error("PowerPoint slide uses an unsupported compression method.");
  }

  if (output.length !== entry.uncompressedSize) {
    throw new Error("PowerPoint slide size does not match its archive manifest.");
  }
  return output;
}

export function extractPptxSlideTexts(archive) {
  const slideEntries = readZipEntries(archive)
    .map((entry) => {
      const match = /^ppt\/slides\/slide([1-9][0-9]*)\.xml$/.exec(entry.name);
      return match ? { entry, slideNumber: Number.parseInt(match[1], 10) } : null;
    })
    .filter(Boolean)
    .sort((left, right) => left.slideNumber - right.slideNumber);

  if (slideEntries.length === 0) {
    throw new Error("PowerPoint archive does not contain reviewable slides.");
  }
  if (new Set(slideEntries.map(({ slideNumber }) => slideNumber)).size !== slideEntries.length) {
    throw new Error("PowerPoint archive contains duplicate slide identifiers.");
  }

  let totalSlideXmlBytes = 0;
  return slideEntries.map(({ entry, slideNumber }) => {
    const xml = readEntryData(archive, entry);
    totalSlideXmlBytes += xml.length;
    if (totalSlideXmlBytes > maximumTotalSlideXmlBytes) {
      throw new Error("PowerPoint slide content exceeds automated review limits.");
    }
    return { slideNumber, text: extractDrawingText(xml.toString("utf8")) };
  });
}

export function evaluateInvestorDeckReview(input) {
  const joinedText = input.slides.map(({ text }) => text).join("\n");
  const forbiddenClaims = forbiddenClaimPatterns
    .filter(({ pattern }) => pattern.test(joinedText))
    .map(({ id }) => id);
  const missingBoundaries = requiredBoundaryPatterns
    .filter(({ pattern }) => !pattern.test(joinedText))
    .map(({ id }) => id);
  const emptySlideCount = input.slides.filter(({ text }) => text.trim().length === 0).length;
  const placeholderCount = input.slides.filter(({ text }) => /\b(?:TODO|TBD|lorem ipsum)\b|\[insert\b/i.test(text)).length;
  const sourceAttributionPresent = /\bsources?:\s/i.test(joinedText) && /\bopenai\.com\//i.test(joinedText);
  const slideCountInRange = input.slides.length >= 8 && input.slides.length <= 20;
  const artifactFingerprintReady = isSha256(input.artifactSha256);
  const checks = [
    {
      id: "artifact-fingerprint",
      passed: artifactFingerprintReady,
      detail: "The reviewed deck is bound to a deterministic SHA-256 fingerprint."
    },
    {
      id: "slide-count",
      passed: slideCountInRange,
      detail: "Investor narrative remains within the bounded 8-20 slide review range."
    },
    {
      id: "nonempty-slides",
      passed: emptySlideCount === 0,
      detail: "Every slide contains audience-facing content."
    },
    {
      id: "placeholder-guard",
      passed: placeholderCount === 0,
      detail: "No unresolved TODO, TBD, or placeholder copy is present."
    },
    {
      id: "forbidden-claims",
      passed: forbiddenClaims.length === 0,
      detail: "No certification, autonomous-care, guaranteed-outcome, doctor-replacement, or implied OpenAI relationship claim is present."
    },
    {
      id: "release-boundaries",
      passed: missingBoundaries.length === 0,
      detail: "Internal-draft, no-PHI, human-review, relationship, external-release, and payer-submission boundaries are present."
    },
    {
      id: "source-attribution",
      passed: sourceAttributionPresent,
      detail: "The strategic-fit slide includes first-party source attribution."
    }
  ];
  const failedChecks = checks.filter((check) => !check.passed).map((check) => check.id);
  const automatedReviewPassed = input.artifactAvailable
    && input.parseSucceeded
    && failedChecks.length === 0;

  return {
    service: "scrimed-investor-deck-review",
    status: !input.artifactAvailable
      ? "artifact-missing-operator-action-required"
      : !input.parseSucceeded
        ? "artifact-review-failed-closed"
        : automatedReviewPassed
          ? "artifact-automated-review-passed-human-release-review-required"
          : "artifact-remediation-required",
    artifactFingerprintSha256: artifactFingerprintReady ? input.artifactSha256 : null,
    artifactFingerprint: artifactFingerprintReady ? input.artifactSha256.slice(0, 16) : "unavailable",
    slideCount: input.slides.length,
    checks,
    failedChecks,
    forbiddenClaimCount: forbiddenClaims.length,
    missingBoundaryCount: missingBoundaries.length,
    emptySlideCount,
    placeholderCount,
    sourceAttributionPresent,
    automatedReviewPassed,
    humanReleaseReviewRequired: true,
    founderReviewRequired: true,
    counselClaimsReviewRequired: true,
    financeReviewRequired: true,
    externalDistributionAuthorized: false,
    investorOutreachAuthorized: false,
    releasePromotionAllowed: false,
    slideTextPrinted: false,
    artifactPathPrinted: false,
    parseErrorCode: input.parseErrorCode ?? null,
    nextActions: automatedReviewPassed
      ? [
          "Record the artifact fingerprint in the controlled release packet.",
          "Obtain founder, counsel/claims, and finance review against this exact fingerprint.",
          "Require immutable source provenance and recipient-specific release authority before external distribution."
        ]
      : [
          "Remediate failed automated checks without weakening clinical, claims, privacy, or relationship boundaries.",
          "Rerun strict artifact review against the revised deck.",
          "Keep external distribution blocked."
        ],
    boundary:
      "Automated deck review checks structure, claim boundaries, attribution, and deterministic artifact identity. It is not legal review, finance approval, securities advice, customer permission, partnership evidence, investment solicitation authority, clinical validation, or external distribution approval."
  };
}

async function inspectDeck() {
  const deckPath = process.env.SCRIMED_INVESTOR_DECK_PATH?.trim() || defaultDeckPath;
  try {
    const archive = await readFile(deckPath);
    const artifactSha256 = sha256(archive);
    try {
      const slides = extractPptxSlideTexts(archive);
      return evaluateInvestorDeckReview({
        artifactAvailable: true,
        parseSucceeded: true,
        artifactSha256,
        slides
      });
    } catch {
      return evaluateInvestorDeckReview({
        artifactAvailable: true,
        parseSucceeded: false,
        parseErrorCode: "pptx-parse-failed",
        artifactSha256,
        slides: []
      });
    }
  } catch {
    return evaluateInvestorDeckReview({
      artifactAvailable: false,
      parseSucceeded: false,
      parseErrorCode: "artifact-unavailable",
      artifactSha256: null,
      slides: []
    });
  }
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function buildStoredZip(entries) {
  const localParts = [];
  const centralParts = [];
  let localOffset = 0;

  for (const [name, content] of entries) {
    const nameBuffer = Buffer.from(name, "utf8");
    const contentBuffer = Buffer.from(content, "utf8");
    const checksum = crc32(contentBuffer);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(contentBuffer.length, 18);
    local.writeUInt32LE(contentBuffer.length, 22);
    local.writeUInt16LE(nameBuffer.length, 26);
    localParts.push(local, nameBuffer, contentBuffer);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(contentBuffer.length, 20);
    central.writeUInt32LE(contentBuffer.length, 24);
    central.writeUInt16LE(nameBuffer.length, 28);
    central.writeUInt32LE(localOffset, 42);
    centralParts.push(central, nameBuffer);
    localOffset += local.length + nameBuffer.length + contentBuffer.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(localOffset, 16);
  return Buffer.concat([...localParts, centralDirectory, end]);
}

function slideXml(text) {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:t>${escaped}</a:t></p:sld>`;
}

function runSelfTest() {
  const boundaryText = [
    "Internal preparation draft",
    "no-PHI",
    "human review",
    "No relationship, endorsement, partnership",
    "External release requires approval",
    "No submission",
    "Sources: openai.com/startups"
  ].join(". ");
  const validArchive = buildStoredZip(
    Array.from({ length: 8 }, (_, index) => [
      `ppt/slides/slide${index + 1}.xml`,
      slideXml(index === 0 ? boundaryText : `Synthetic investor narrative slide ${index + 1}`)
    ])
  );
  const slides = extractPptxSlideTexts(validArchive);
  const valid = evaluateInvestorDeckReview({
    artifactAvailable: true,
    parseSucceeded: true,
    artifactSha256: sha256(validArchive),
    slides
  });
  const unsafe = evaluateInvestorDeckReview({
    artifactAvailable: true,
    parseSucceeded: true,
    artifactSha256: sha256("unsafe"),
    slides: slides.map((slide, index) =>
      index === 1 ? { ...slide, text: `${slide.text} OpenAI partner. HIPAA certified.` } : slide
    )
  });
  const missing = evaluateInvestorDeckReview({
    artifactAvailable: false,
    parseSucceeded: false,
    artifactSha256: null,
    slides: []
  });

  if (
    slides.length !== 8
    || !valid.automatedReviewPassed
    || valid.externalDistributionAuthorized
    || valid.releasePromotionAllowed
    || !valid.humanReleaseReviewRequired
    || unsafe.automatedReviewPassed
    || unsafe.forbiddenClaimCount !== 2
    || missing.status !== "artifact-missing-operator-action-required"
  ) {
    throw new Error("Investor deck review self-test failed.");
  }

  console.log("pass SCRIMED investor deck review policy self-test");
}

if (args.has("--self-test")) {
  runSelfTest();
  process.exit(0);
}

const report = await inspectDeck();

if (args.has("--json")) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`report SCRIMED investor deck review: ${report.status}`);
  console.log(`artifact_fingerprint=${report.artifactFingerprint} slides=${report.slideCount} automated_review_passed=${report.automatedReviewPassed}`);
  console.log(`failed_checks=${report.failedChecks.length} forbidden_claims=${report.forbiddenClaimCount} missing_boundaries=${report.missingBoundaryCount}`);
  console.log(`human_release_review_required=${report.humanReleaseReviewRequired} external_distribution_authorized=${report.externalDistributionAuthorized}`);
  console.log(report.boundary);
  console.log("release_promotion_allowed=false");
}

if (args.has("--strict") && !report.automatedReviewPassed) {
  process.exitCode = 1;
}
