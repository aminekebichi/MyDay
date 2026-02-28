import prisma from "./prisma";

export async function validateSession(request: Request) {
    const sessionToken = request.headers.get("X-Session-Token");

    if (!sessionToken) {
        throw new Error("UNAUTHORIZED");
    }

    const user = await prisma.user.findUnique({
        where: { sessionToken },
    });

    if (!user) {
        throw new Error("UNAUTHORIZED");
    }

    return user;
}
