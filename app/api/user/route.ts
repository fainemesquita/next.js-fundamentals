import { NextRequest, NextResponse } from "next/server"

export const GET = (req: NextRequest) => {
    return NextResponse.json({ data: {message: "Hello!"} }) 
}

// export const POST = () => {

// }

// export const PUT = () => {

// }

// export const DELETE = () => {

// }   