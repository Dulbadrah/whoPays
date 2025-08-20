import AnimatedDot from "@/app/(home)/components/AnimatedDot"

export const AnimatedDotAll = ()=> {
    return (
            <div className="mt-8 sm:mt-12 flex justify-center space-x-2 sm:space-x-4">
          <AnimatedDot color="bg-yellow-300" delay="0ms" />
          <AnimatedDot color="bg-white" delay="200ms" />
          <AnimatedDot color="bg-red-400" delay="400ms" />
        </div>
    )
}