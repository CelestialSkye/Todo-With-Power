import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTodo } from "@/hooks/useTodo";
import { ThemeToggle } from "./theme-toggle";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ToDo() {
  const { tasks, addTask, removeTask } = useTodo();
  const [inputValue, setInputValue] = useState("");

  function handleAddTask() {
    addTask(inputValue);
    setInputValue("");
  }

  return (
    <div className="w-full max-w-md mx-auto mt-10 space-y-6">
       <div className="p-4">
      <ThemeToggle />
      <h1 className="text-3xl font-bold mt-4">Hello!</h1>
    </div>
      <Card>
        <CardHeader>
          <CardTitle>Add a Task</CardTitle>
        </CardHeader>

        <CardContent className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter something..."
            className="flex-1"
          />

          <Button onClick={handleAddTask}>
            Add
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Tasks</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {tasks.map((task, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{task}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      onClick={() => removeTask(index)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {tasks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                    No tasks yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}
