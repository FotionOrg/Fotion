'use server'

import { Task } from '@/types'
import { getDB } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getTasksAction(): Promise<Task[]> {
  const db = getDB()
  return db.getTasks()
}

export async function getTaskAction(id: string): Promise<Task | null> {
  const db = getDB()
  return db.getTask(id) || null
}

export async function createTaskAction(
  taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Task> {
  const db = getDB()

  const newTask: Task = {
    ...taskData,
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  db.addTask(newTask)
  revalidatePath('/')

  return newTask
}

export async function updateTaskAction(
  id: string,
  updates: Partial<Task>
): Promise<Task | null> {
  console.log('updateTaskAction called:', { id, updates })
  const db = getDB()
  const updated = db.updateTask(id, updates)
  console.log('updateTaskAction result:', updated)

  if (updated) {
    revalidatePath('/')
  }

  return updated
}

export async function deleteTaskAction(id: string): Promise<boolean> {
  const db = getDB()
  const deleted = db.deleteTask(id)

  if (deleted) {
    revalidatePath('/')
  }

  return deleted
}
