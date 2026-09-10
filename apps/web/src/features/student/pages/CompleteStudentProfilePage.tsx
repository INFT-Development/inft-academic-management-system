import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  matchRollNumberSchema,
  studentAcademicDetailsSchema,
  STUDENT_YEARS,
  STUDENT_DIVISIONS,
  STUDENT_SEMESTERS,
  STUDENT_BRANCHES,
  STUDENT_SPECIALIZATIONS,
  type MatchRollNumberInput,
  type StudentAcademicDetailsInput,
  type StudentAcademicDetailsFormInput,
} from "@ams/shared";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useOrganization } from "@/hooks/useOrganization";
import { matchByRollNumber, createStudentBySelf } from "@/features/students/students.api";

export function CompleteStudentProfilePage() {
  const navigate = useNavigate();
  const { currentMembership, refreshMemberships } = useOrganization();

  // "match": step 1, ask for a roll number. "form": step 2, no pre-existing
  // record was found — collect full academic details instead.
  const [step, setStep] = useState<"match" | "form">("match");
  const [rollNumberHint, setRollNumberHint] = useState("");

  if (!currentMembership) return null;

  const organizationId = currentMembership.organizationId;

  async function completeAndContinue() {
    await refreshMemberships();
    navigate("/dashboard/student", { replace: true });
  }

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        title="Complete your profile"
        description={`Finish setting up your student profile for ${currentMembership.organizationName}.`}
      />

      {step === "match" ? (
        <MatchRollNumberForm
          organizationId={organizationId}
          onLinked={completeAndContinue}
          onNoMatch={(rollNumber) => {
            setRollNumberHint(rollNumber);
            setStep("form");
          }}
        />
      ) : (
        <AcademicDetailsForm
          organizationId={organizationId}
          initialRollNumber={rollNumberHint}
          onCreated={completeAndContinue}
          onBack={() => setStep("match")}
        />
      )}
    </div>
  );
}

function MatchRollNumberForm({
  organizationId,
  onLinked,
  onNoMatch,
}: {
  organizationId: string;
  onLinked: () => void;
  onNoMatch: (rollNumber: string) => void;
}) {
  const [serverError, setServerError] = useState("");

  const form = useForm<MatchRollNumberInput>({
    resolver: zodResolver(matchRollNumberSchema),
    defaultValues: { rollNumber: "" },
  });

  async function onSubmit(values: MatchRollNumberInput) {
    setServerError("");

    try {
      await matchByRollNumber(organizationId, values.rollNumber);
      toast.success("Your student record was found and linked");
      onLinked();
    } catch (error) {
      // A 404 here just means "no pre-existing record" — that's an expected
      // branch of the flow, not an error condition to show the student.
      if (error instanceof Error && /no pre-existing/i.test(error.message)) {
        onNoMatch(values.rollNumber);
        return;
      }

      setServerError(error instanceof Error ? error.message : "Failed to look up your roll number");
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          If your organization already uploaded your academic details, enter your roll
          number to link your account automatically.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="rollNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roll number</FormLabel>
                  <FormControl>
                    <Input placeholder="101" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {serverError && <p className="text-sm text-destructive">{serverError}</p>}

            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
              {form.formState.isSubmitting ? "Checking..." : "Continue"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => onNoMatch(form.getValues("rollNumber"))}
            >
              I don't have a roll number yet
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function AcademicDetailsForm({
  organizationId,
  initialRollNumber,
  onCreated,
  onBack,
}: {
  organizationId: string;
  initialRollNumber: string;
  onCreated: () => void;
  onBack: () => void;
}) {
  const [serverError, setServerError] = useState("");

  const form = useForm<StudentAcademicDetailsFormInput, unknown, StudentAcademicDetailsInput>({
    resolver: zodResolver(studentAcademicDetailsSchema),
    defaultValues: {
      rollNumber: initialRollNumber,
      studentFullName: "",
      year: "1st",
      semester: 1,
      division: "A",
      branch: STUDENT_BRANCHES[0],
      batch: new Date().getFullYear(),
      specialization: "",
    },
  });

  async function onSubmit(values: StudentAcademicDetailsInput) {
    setServerError("");

    try {
      await createStudentBySelf(organizationId, values);
      toast.success("Your student profile was created");
      onCreated();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Failed to save your details");
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          We couldn't find a pre-existing record for that roll number. Enter your
          academic details to finish setting up your profile.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="rollNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roll number</FormLabel>
                  <FormControl>
                    <Input placeholder="101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="studentFullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input placeholder="Rahul Sharma" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STUDENT_YEARS.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="semester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semester</FormLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STUDENT_SEMESTERS.map((semester) => (
                          <SelectItem key={semester} value={String(semester)}>
                            {semester}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="division"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Division</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STUDENT_DIVISIONS.map((division) => (
                          <SelectItem key={division} value={division}>
                            {division}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STUDENT_BRANCHES.map((branch) => (
                          <SelectItem key={branch} value={branch}>
                            {branch}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="batch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2027"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialization (optional)</FormLabel>
                  <Select
                    value={field.value || "__none__"}
                    onValueChange={(value) => field.onChange(value === "__none__" ? "" : value)}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {STUDENT_SPECIALIZATIONS.map((specialization) => (
                        <SelectItem key={specialization} value={specialization}>
                          {specialization}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {serverError && <p className="text-sm text-destructive">{serverError}</p>}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                Back
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting} className="flex-1">
                {form.formState.isSubmitting ? "Saving..." : "Finish"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
