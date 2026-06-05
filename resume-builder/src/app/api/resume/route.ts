import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/mongodb";
import { getCurrentUser, AuthError } from "@/lib/getCurrentUser";
import ResumeModel from "@/models/Resume.model";
import { ApiResponse } from "@/types/api.types";

export async function GET(req: NextRequest) {
  try {
    await connectToMongoDB();

    const userId = await getCurrentUser();
    console.log("Fetching resumes for user ID:", userId);

    // Find all resumes belonging to this user
    const resumes = await ResumeModel.find({ user_id: userId }).sort({ updatedAt: -1 });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "Resumes fetched successfully",
        data: resumes,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("error in get all resumes api", error);
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
