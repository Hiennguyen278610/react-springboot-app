import illustration from "@/assets/team-presentation-1-19.svg";

export default function LoginIllustration() {
    return (
        <div className="w-1/2 h-full">
            <div className="flex items-center w-full h-1/10 px-20">
                <h1 className="text-3xl font-semibold">FL<span className="text-primary">O</span>GIN</h1>
            </div>
            <div className="flex items-center justify-center w-full h-9/10 p-4">
                <img src={illustration} alt="illustration" className="w-full h-4/5" />
            </div>
        </div>
    )
}