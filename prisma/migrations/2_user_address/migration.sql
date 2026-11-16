-- Saved delivery address on the account (all optional).
ALTER TABLE "User" ADD COLUMN "addrLine1" TEXT,
  ADD COLUMN "addrLine2" TEXT,
  ADD COLUMN "addrCity" TEXT,
  ADD COLUMN "addrState" TEXT,
  ADD COLUMN "addrPostal" TEXT;
