import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/mongodb";
import { getCurrentUser, AuthError } from "@/lib/getCurrentUser";
import ResumeModel from "@/models/Resume.model";
import { ApiResponse } from "@/types/api.types";

export async function POST(req: NextRequest) {
  try {
    await connectToMongoDB();

    const userId = await getCurrentUser();

    const body = await req.json();
    const { title, jobTitle, experienceLevel } = body;

    if (!title || !jobTitle || !experienceLevel) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Title, Job Title, and Experience Level are required",
        },
        { status: 400 }
      );
    }

    const newResume = await ResumeModel.create({
      user_id: userId,
      title: title,
      jobTitle: jobTitle,
      experienceLevel: experienceLevel,
      summary: "",
      personalInfo: {
        fullname: "",
        email: "",
        mobile: "",
        location: "",
        github: "",
        linkedIn: "",
        portfolio: ""
      },
      workExperience: [],
      projects: [],
      education: [],
      skills: [],
      certifications: []
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "Resume created successfully",
        data: newResume,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.log("error in create resume api", error);
    if (error instanceof AuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}