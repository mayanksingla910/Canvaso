import { useId } from "react"

function TransparentIcon() {
  const id = useId() 
  const patternId = `checker-${id}`

  return (
    <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id={patternId} x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="4" height="4" fill="#b0b0b0"/>
          <rect x="4" y="4" width="4" height="4" fill="#b0b0b0"/>
          <rect x="4" y="0" width="4" height="4" fill="#e8e8e8"/>
          <rect x="0" y="4" width="4" height="4" fill="#e8e8e8"/>
        </pattern>
      </defs>
      <rect width="28" height="28" rx="4" fill={`url(#${patternId})`}/>
    </svg>
  )
}

export default TransparentIcon