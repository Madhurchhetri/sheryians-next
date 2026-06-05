import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/api.types";

export async function POST(req: NextRequest) {
  const response = NextResponse.json<ApiResponse>(
    {
      success: true,
      message: "Logged out successfully",
    },
    { status: 200 }
  );

  response.cookies.delete("token");
  return response;
}
