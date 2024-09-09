import React, { useContext } from 'react'
import "./main.css"
import { memo } from 'react'
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