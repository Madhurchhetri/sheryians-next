import { getCurrentUser, AuthError } from "@/lib/getCurrentUser";
import { connectToMongoDB } from "@/lib/mongodb";
import ResumeModel from "@/models/Resume.model";
import { ApiResponse } from "@/types/api.types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ resumeId: string }> }
) {
  try {
    await connectToMongoDB();

    const user = await getCurrentUser();
    console.log("User in GET resume:", user);

    const { resumeId } = await params;
    console.log("Resume ID in GET:", resumeId);

    const resume = await ResumeModel.findOne({
      _id: resumeId,
      user_id: user,
    });

    console.log("Resume found:", resume);

    if (!resume)
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Resume not found or unauthorized",
        },
        { status: 404 }
      );

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "Resume fetched successfully",
        data: resume,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("error in get resume api", error);
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ resumeId: string }> }
) {
  try {
    await connectToMongoDB();

    const user = await getCurrentUser();
    console.log("User in PATCH resume:", user);

    const body = await req.json();
    console.log("PATCH body:", body);

    const { resumeId } = await params;
    console.log("Resume ID in PATCH:", resumeId);

    const updatedResume = await ResumeModel.findOneAndUpdate(
      {
        _id: resumeId,
        user_id: user,
      },
      {
        $set: body,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedResume)
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Resume failed to update or unauthorized",
        },
        { status: 400 }
      );

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "Resume updated successfully",
        data: updatedResume,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("error in update resume api", error);
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ resumeId: string }> }
) {
  try {
    await connectToMongoDB();

    const user = await getCurrentUser();
    const { resumeId } = await params;

    const deletedResume = await ResumeModel.findOneAndDelete({
      _id: resumeId,
      user_id: user,
    });

    if (!deletedResume)
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Resume not found or unauthorized",
        },
        { status: 404 }
      );

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "Resume deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("error in delete resume api", error);
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