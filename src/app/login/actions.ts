"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { createClient } from "@/utils/supabase/server"

export async function login(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error(error)
    revalidatePath("/login", "page")
    redirect(
      `/login?error=${error.name}&error_description=${
        error.message
      }&error_code=${error.status}&t=${Date.now()}`
    )
  }

  revalidatePath("/", "layout")
  redirect("/")
}

export async function signup(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.error(error)
    redirect(
      `/login?error=${error.name}&error_description=${error.message}&error_code=${error.status}`
    )
  }

  revalidatePath("/", "layout")
  redirect("/")
}

export async function reset(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const email = formData.get("email") as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/login/reset`,
  })

  if (error) {
    console.error(error)
    redirect(
      `/login/reset?error=${error.name}&error_description=${error.message}&error_code=${error.status}`
    )
  }

  redirect(`/login/reset?t=${Date.now()}`)
}

export async function update(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const password = formData.get("password") as string

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    console.error(error)
    redirect(`/login/reset?error=${JSON.stringify(error)}`)
  }

  revalidatePath("/", "layout")
  redirect("/")
}
