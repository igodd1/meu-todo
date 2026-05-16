import { createClient } from "@supabase/supabase-js";

// Substitua os textos abaixo pelas suas chaves do Supabase
const supabaseUrl = "https://cbqemyctbfuptahpbqpe.supabase.co"; 
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNicWVteWN0YmZ1cHRhaHBicXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NDY1NDAsImV4cCI6MjA5NDUyMjU0MH0.-bdRTjtLqh4MmCD_CxhjLCeI-vyWnjrDHm_t1iSe1BY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export type Todo = {
  id: number;
  task: string;
  is_completed: boolean;
  created_at: string;
};

export async function fetchTodos(): Promise<Todo[]> {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Todo[];
}

export async function insertTodo(task: string): Promise<void> {
  const { error } = await supabase.from("todos").insert({ task });
  if (error) throw error;
}

export async function updateTodoCompleted(id: number, is_completed: boolean): Promise<void> {
  const { error } = await supabase
    .from("todos")
    .update({ is_completed })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteTodo(id: number): Promise<void> {
  const { error } = await supabase.from("todos").delete().eq("id", id);
  if (error) throw error;
}