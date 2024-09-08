import React, { useContext } from 'react'
import "./main.css"
export default function Main({children}) {
  return (
    <main>
      <div className="bg"></div>
      <div className='content'>
        {children}        
      </div>
    </main>
  )
}
