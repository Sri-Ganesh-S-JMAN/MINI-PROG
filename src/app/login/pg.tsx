"use client"
 
import { useRouter } from "next/navigation"
import { useState } from "react"
 
export default function Login() {
  const router = useRouter()
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
 
  const handleLogin = async () => {
 
    const res = await fetch("/api/login", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ email,password })
    })
 
    const data = await res.json()
 
    if(data.role === "ADMIN"){
      router.push("/dashboard")
    } else {
      router.push("/tickets")
    }
  }
 
  return (
    <div>
      <input onChange={e=>setEmail(e.target.value)} />
      <input type="password" onChange={e=>setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  )
}
 