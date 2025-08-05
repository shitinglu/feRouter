import { signOut } from "@/auth"

export function SignOut() {
    return (
        <form
            action={async () => {
                "use server"
                await signOut()
            }}
        >
            <button type="submit" className="font-[12px]">退出登陆</button>
        </form>
    )
}