import React, { useContext , memo} from "react"
import "./main.css"
export default memo( function Main({children}) {
  return (
    <main>
      <div className='content'>
        {children}        
      </div>
    </main>
  )
}
)