import React from "react"

export const highlightText = (text: string, globalFilter: string) => {
  if (!globalFilter) return text

  const parts = text?.split(new RegExp(`(${globalFilter})`, "gi"))
  if (!parts) return text
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === globalFilter ? (
          <mark key={i}>{part}</mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  )
}
