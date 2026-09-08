import request from "supertest";

jest.mock("../../src/config/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    membership: {
      findUnique: jest.fn(),
    },
    student: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock("../../src/config/supabase", () => ({
  supabaseAdmin: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

import app from "../../src/app";
import { prisma } from "../../src/config/prisma";
import { supabaseAdmin } from "../../src/config/supabase";

const mockUserFindUnique = prisma.user.findUnique as jest.Mock;
const mockMembershipFindUnique = prisma.membership.findUnique as jest.Mock;
const mockStudentFindUnique = prisma.student.findUnique as jest.Mock;
const mockStudentFindMany = prisma.student.findMany as jest.Mock;
const mockStudentCount = prisma.student.count as jest.Mock;
const mockStudentCreate = prisma.student.create as jest.Mock;
const mockStudentCreateMany = prisma.student.createMany as jest.Mock;
const mockStudentUpdate = prisma.student.update as jest.Mock;
const mockTransaction = prisma.$transaction as jest.Mock;
const mockGetUser = supabaseAdmin.auth.getUser as jest.Mock;

const ORG_A = "org-a";
const ORG_B = "org-b";

function authAs(userId: string, email: string) {
  mockGetUser.mockResolvedValue({ data: { user: { id: userId, email } }, error: null });
  mockUserFindUnique.mockResolvedValue({ id: userId, email });
}

function membershipIn(organizationId: string, role: string) {
  mockMembershipFindUnique.mockImplementation(({ where }: any) => {
    if (where.userId_organizationId.organizationId === organizationId) {
      return Promise.resolve({ id: "membership-1", organizationId, role, userId: "user-1" });
    }
    return Promise.resolve(null);
  });
}

const AUTH_HEADER = { Authorization: "Bearer valid-token" };

describe("Student API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTransaction.mockImplementation(async (callback: any) => callback(prisma));
  });

  // ============================================================
  // AUTHORIZATION
  // ============================================================
  describe("authorization", () => {
    it("allows super_admin to list students", async () => {
      authAs("user-1", "super@test.com");
      membershipIn(ORG_A, "SUPER_ADMIN");
      mockStudentFindMany.mockResolvedValue([]);
      mockStudentCount.mockResolvedValue(0);

      const response = await request(app)
        .get(`/api/organizations/${ORG_A}/students`)
        .set(AUTH_HEADER);

      expect(response.status).toBe(200);
    });

    it("allows admin to list students", async () => {
      authAs("user-1", "admin@test.com");
      membershipIn(ORG_A, "ADMIN");
      mockStudentFindMany.mockResolvedValue([]);
      mockStudentCount.mockResolvedValue(0);

      const response = await request(app)
        .get(`/api/organizations/${ORG_A}/students`)
        .set(AUTH_HEADER);

      expect(response.status).toBe(200);
    });

    it("rejects a teacher from listing students", async () => {
      authAs("user-1", "teacher@test.com");
      membershipIn(ORG_A, "TEACHER");

      const response = await request(app)
        .get(`/api/organizations/${ORG_A}/students`)
        .set(AUTH_HEADER);

      expect(response.status).toBe(403);
    });

    it("rejects a student from listing students", async () => {
      authAs("user-1", "student@test.com");
      membershipIn(ORG_A, "STUDENT");

      const response = await request(app)
        .get(`/api/organizations/${ORG_A}/students`)
        .set(AUTH_HEADER);

      expect(response.status).toBe(403);
    });

    it("rejects a teacher from importing students", async () => {
      authAs("user-1", "teacher@test.com");
      membershipIn(ORG_A, "TEACHER");

      const response = await request(app)
        .post(`/api/organizations/${ORG_A}/students/import`)
        .set(AUTH_HEADER)
        .attach("file", Buffer.from("roll_number\n101"), "students.csv");

      expect(response.status).toBe(403);
    });

    it("rejects a student from importing students", async () => {
      authAs("user-1", "student@test.com");
      membershipIn(ORG_A, "STUDENT");

      const response = await request(app)
        .post(`/api/organizations/${ORG_A}/students/import`)
        .set(AUTH_HEADER)
        .attach("file", Buffer.from("roll_number\n101"), "students.csv");

      expect(response.status).toBe(403);
    });

    it("rejects an admin of one organization acting on a different organization's students", async () => {
      authAs("user-1", "admin@test.com");
      membershipIn(ORG_A, "ADMIN");

      const response = await request(app)
        .get(`/api/organizations/${ORG_B}/students`)
        .set(AUTH_HEADER);

      expect(response.status).toBe(403);
    });
  });

  // ============================================================
  // VALIDATION (import preview)
  // ============================================================
  describe("import validation", () => {
    beforeEach(() => {
      authAs("user-1", "admin@test.com");
      membershipIn(ORG_A, "ADMIN");
    });

    it("rejects an invalid year, semester, division, and a missing required field", async () => {
      mockStudentFindMany.mockResolvedValue([]);

      const csv = [
        "roll_number,student_full_name,year,semester,division,branch,batch,specialization",
        "101,Rahul Sharma,5th,3,A,CMPN,2027,AI & ML", // invalid year
        "102,Aman Patel,2nd,9,B,CMPN,2027,", // invalid semester
        "103,Priya Singh,1st,1,Z,INFT,2028,", // invalid division
        ",Missing Roll,1st,1,A,INFT,2028,", // missing roll number
      ].join("\n");

      const response = await request(app)
        .post(`/api/organizations/${ORG_A}/students/import`)
        .set(AUTH_HEADER)
        .attach("file", Buffer.from(csv), "students.csv");

      expect(response.status).toBe(200);
      expect(response.body.data.totalRows).toBe(4);
      expect(response.body.data.validCount).toBe(0);
      expect(response.body.data.invalidCount).toBe(4);
    });

    it("rejects duplicate roll numbers within the uploaded file", async () => {
      mockStudentFindMany.mockResolvedValue([]);

      const csv = [
        "roll_number,student_full_name,year,semester,division,branch,batch,specialization",
        "101,Rahul Sharma,2nd,3,A,CMPN,2027,AI & ML",
        "101,Duplicate Roll,2nd,3,B,CMPN,2027,",
      ].join("\n");

      const response = await request(app)
        .post(`/api/organizations/${ORG_A}/students/import`)
        .set(AUTH_HEADER)
        .attach("file", Buffer.from(csv), "students.csv");

      expect(response.status).toBe(200);
      expect(response.body.data.validCount).toBe(1);
      expect(response.body.data.invalidCount).toBe(1);
      expect(response.body.data.invalidRows[0].errors[0]).toMatch(/duplicate roll number/i);
    });

    it("rejects a roll number that already exists in the organization", async () => {
      mockStudentFindMany.mockResolvedValue([{ rollNumber: "101" }]);

      const csv = [
        "roll_number,student_full_name,year,semester,division,branch,batch,specialization",
        "101,Rahul Sharma,2nd,3,A,CMPN,2027,AI & ML",
      ].join("\n");

      const response = await request(app)
        .post(`/api/organizations/${ORG_A}/students/import`)
        .set(AUTH_HEADER)
        .attach("file", Buffer.from(csv), "students.csv");

      expect(response.status).toBe(200);
      expect(response.body.data.validCount).toBe(0);
      expect(response.body.data.invalidCount).toBe(1);
      expect(response.body.data.invalidRows[0].errors[0]).toMatch(/already exists/i);
    });

    it("accepts a valid CSV row and normalizes batch formats", async () => {
      mockStudentFindMany.mockResolvedValue([]);

      const csv = [
        "roll_number,student_full_name,year,semester,division,branch,batch,specialization",
        "101,Rahul Sharma,2nd,3,A,CMPN,27 batch,AI & ML",
      ].join("\n");

      const response = await request(app)
        .post(`/api/organizations/${ORG_A}/students/import`)
        .set(AUTH_HEADER)
        .attach("file", Buffer.from(csv), "students.csv");

      expect(response.status).toBe(200);
      expect(response.body.data.validCount).toBe(1);
      expect(response.body.data.validRows[0].data.batch).toBe(2027);
    });
  });

  // ============================================================
  // MATCHING
  // ============================================================
  describe("student matching / onboarding", () => {
    beforeEach(() => {
      authAs("user-1", "student@test.com");
      membershipIn(ORG_A, "STUDENT");
    });

    it("links a pre-imported student found by roll number within the correct organization", async () => {
      mockStudentFindUnique.mockImplementation(({ where }: any) => {
        if (where.organizationId_userId) return Promise.resolve(null); // not yet linked
        if (where.organizationId_rollNumber) {
          return Promise.resolve({
            id: "student-1",
            organizationId: ORG_A,
            userId: null,
            rollNumber: "101",
            studentFullName: "Rahul Sharma",
            year: "2nd",
            semester: 3,
            division: "A",
            branch: "CMPN",
            batch: 2027,
            specialization: "AI & ML",
            origin: "ADMIN",
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        return Promise.resolve(null);
      });
      mockStudentUpdate.mockResolvedValue({
        id: "student-1",
        organizationId: ORG_A,
        userId: "user-1",
        rollNumber: "101",
        studentFullName: "Rahul Sharma",
        year: "2nd",
        semester: 3,
        division: "A",
        branch: "CMPN",
        batch: 2027,
        specialization: "AI & ML",
        origin: "ADMIN",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post(`/api/organizations/${ORG_A}/students/me/match`)
        .set(AUTH_HEADER)
        .send({ rollNumber: "101" });

      expect(response.status).toBe(200);
      expect(response.body.data.student.rollNumber).toBe("101");
      expect(response.body.data.source).toBe("pre_registered");
      expect(mockStudentUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ data: { userId: "user-1" } })
      );
    });

    it("does not match a roll number that only exists in a different organization", async () => {
      mockStudentFindUnique.mockImplementation(({ where }: any) => {
        if (where.organizationId_userId) return Promise.resolve(null);
        if (where.organizationId_rollNumber?.organizationId === ORG_A) return Promise.resolve(null);
        return Promise.resolve(null);
      });

      const response = await request(app)
        .post(`/api/organizations/${ORG_A}/students/me/match`)
        .set(AUTH_HEADER)
        .send({ rollNumber: "999" });

      expect(response.status).toBe(404);
    });

    it("rejects matching a roll number already linked to a different account", async () => {
      mockStudentFindUnique.mockImplementation(({ where }: any) => {
        if (where.organizationId_userId) return Promise.resolve(null);
        if (where.organizationId_rollNumber) {
          return Promise.resolve({ id: "student-1", userId: "some-other-user" });
        }
        return Promise.resolve(null);
      });

      const response = await request(app)
        .post(`/api/organizations/${ORG_A}/students/me/match`)
        .set(AUTH_HEADER)
        .send({ rollNumber: "101" });

      expect(response.status).toBe(409);
    });

    it("returns 404 (no match) when there is no pre-existing record, prompting the details form", async () => {
      mockStudentFindUnique.mockResolvedValue(null);

      const response = await request(app)
        .post(`/api/organizations/${ORG_A}/students/me/match`)
        .set(AUTH_HEADER)
        .send({ rollNumber: "555" });

      expect(response.status).toBe(404);
    });

    it("reports no profile and source 'new' from the onboarding-status endpoint when unmatched", async () => {
      mockStudentFindUnique.mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/organizations/${ORG_A}/students/me`)
        .set(AUTH_HEADER);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({ student: null, profileComplete: false, source: "new" });
    });

    it("auto-links a pre-imported student by email from the onboarding-status endpoint", async () => {
      authAs("user-1", "student@vit.edu.in");
      mockStudentFindUnique.mockImplementation(({ where }: any) => {
        if (where.organizationId_userId) return Promise.resolve(null); // not yet linked
        if (where.organizationId_email) {
          return Promise.resolve({
            id: "student-1",
            organizationId: ORG_A,
            userId: null,
            rollNumber: "101",
            studentFullName: "Rahul Sharma",
            email: "student@vit.edu.in",
            year: "2nd",
            semester: 3,
            division: "A",
            branch: "CMPN",
            batch: 2027,
            specialization: null,
            status: "ACTIVE",
            origin: "ADMIN",
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        return Promise.resolve(null);
      });
      mockStudentUpdate.mockResolvedValue({
        id: "student-1",
        organizationId: ORG_A,
        userId: "user-1",
        rollNumber: "101",
        studentFullName: "Rahul Sharma",
        email: "student@vit.edu.in",
        year: "2nd",
        semester: 3,
        division: "A",
        branch: "CMPN",
        batch: 2027,
        specialization: null,
        status: "ACTIVE",
        origin: "ADMIN",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .get(`/api/organizations/${ORG_A}/students/me`)
        .set(AUTH_HEADER);

      expect(response.status).toBe(200);
      expect(response.body.data.profileComplete).toBe(true);
      expect(response.body.data.source).toBe("pre_registered");
      expect(response.body.data.student.rollNumber).toBe("101");
      expect(mockStudentUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ data: { userId: "user-1" } })
      );
    });
  });

  // ============================================================
  // IMPORT CONFIRM — all-or-nothing
  // ============================================================
  describe("import confirm", () => {
    beforeEach(() => {
      authAs("user-1", "admin@test.com");
      membershipIn(ORG_A, "ADMIN");
    });

    const validRow = {
      rollNumber: "101",
      studentFullName: "Rahul Sharma",
      year: "2nd",
      semester: 3,
      division: "A",
      branch: "CMPN",
      batch: 2027,
      specialization: "AI & ML",
    };

    it("imports valid rows inside a transaction", async () => {
      mockStudentFindMany.mockResolvedValueOnce([]); // no existing conflicts
      mockStudentCreateMany.mockResolvedValue({ count: 1 });
      mockStudentFindMany.mockResolvedValueOnce([{ ...validRow, id: "s1", organizationId: ORG_A, userId: null, origin: "ADMIN", createdAt: new Date(), updatedAt: new Date() }]);

      const response = await request(app)
        .post(`/api/organizations/${ORG_A}/students/import/confirm`)
        .set(AUTH_HEADER)
        .send({ rows: [validRow] });

      expect(response.status).toBe(201);
      expect(response.body.data.imported).toBe(1);
      expect(mockStudentCreateMany).toHaveBeenCalled();
    });

    it("aborts the whole import and creates nothing when a row now conflicts", async () => {
      mockStudentFindMany.mockResolvedValueOnce([{ rollNumber: "101" }]); // conflict discovered inside the transaction

      const response = await request(app)
        .post(`/api/organizations/${ORG_A}/students/import/confirm`)
        .set(AUTH_HEADER)
        .send({ rows: [validRow] });

      expect(response.status).toBe(409);
      expect(mockStudentCreateMany).not.toHaveBeenCalled();
    });

    it("rejects a submission with duplicate roll numbers before touching the database", async () => {
      const response = await request(app)
        .post(`/api/organizations/${ORG_A}/students/import/confirm`)
        .set(AUTH_HEADER)
        .send({ rows: [validRow, { ...validRow }] });

      expect(response.status).toBe(409);
      expect(mockStudentFindMany).not.toHaveBeenCalled();
      expect(mockStudentCreateMany).not.toHaveBeenCalled();
    });
  });
});
