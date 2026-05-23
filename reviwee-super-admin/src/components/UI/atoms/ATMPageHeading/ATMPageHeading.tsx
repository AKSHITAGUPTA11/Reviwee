import type { ReactNode } from "react";

type Props = {
    children: ReactNode
}

const ATMPageHeading = ({children}: Props) => {
  return (
    <span className="text-xl font-semibold text-slate-600 mobile-typo-page-heading"> {children} </span>
  )
}

export default ATMPageHeading