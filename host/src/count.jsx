import React from 'react'
import { useState } from 'react'

function count() {
    const [state,setState]=useState(0);

  return (
    <div>
        <p>count:{state}</p>
        <button onChange={()=>setState(state+1)}/>
    </div>
  )
}

export default count