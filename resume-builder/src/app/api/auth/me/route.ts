import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/mongodb";
import { getCurrentUser, AuthError } from "@/lib/getCurrentUser";
import UserModel from "@/models/User.model";
import { ApiResponse } from "@/types/api.types";

export async function GET(req: NextRequest) {
  try {
    await connectToMongoDB();

    const userId = await getCurrentUser();
    const user = await UserModel.findById(userId).select("-password");

    if (!user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "User profile fetched successfully",
        data: user,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Not authenticated",
      },
      { status: 401 }
    );
  }
}
