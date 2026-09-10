-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" UUID,
    "rollNumber" TEXT NOT NULL,
    "studentFullName" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "division" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "batch" INTEGER NOT NULL,
    "specialization" TEXT,
    "origin" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_organizationId_rollNumber_key" ON "Student"("organizationId", "rollNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Student_organizationId_userId_key" ON "Student"("organizationId", "userId");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
