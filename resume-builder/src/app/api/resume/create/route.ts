import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/getCurrentUser";
import ResumeModel from "@/models/Resume.model";
import { ApiResponse } from "@/types/api.types";

export async function POST(req:NextRequest) {
    try{
        await connectToMongoDB()

        const userId = await getCurrentUser()

        const newResume = await ResumeModel.create({
            user_id: userId,
            title: "",
            summary: "",
            personalInfo: {},
            workExperience: [],
            projects: [],
            education: [],
            skills: [],
            certifications: []
        })

        return NextResponse.json<ApiResponse>({
            success: true, message: "Resume created successfully", data : newResume
        },{status: 201})

    }catch(error){
        console.log("error in create resume api", error)
        return NextResponse.json<ApiResponse>({
            success: false, message: "Something went wrong", 
        },{status: 500})
    }
    
}