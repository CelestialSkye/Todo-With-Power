import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTodo } from "@/hooks/useTodo";
import { ThemeToggle } from "./theme-toggle";

import {
  ListGroup,
  ListHeader,
  ListItem,
  ListItems,
  ListProvider,
} from "@/components/ui/shadcn-io/list";

export function ToDo() {
  const { tasks, addTask, removeTask } = useTodo();
  const [inputValue, setInputValue] = useState("");

  function handleAddTask() {
    if (!inputValue.trim()) return;
    addTask(inputValue);
    setInputValue("");
  }

  return (
    <>
      <div className="w-full max-w-md mx-auto mt-10 space-y-6">

        <div className="p-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Hello!</h1>
          <ThemeToggle />
        </div>

        <ListProvider>
          <div className="flex gap-2 p-4">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter something..."
              className="flex-1"
            />
            <Button onClick={handleAddTask}>Add</Button>
          </div>

          <ListGroup id="tasks">
            <ListHeader name="Tasks" />

            <ListItems>
              {tasks.map((task, index) => (
                <ListItem key={index}>
                  <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />

                  <p className="m-0 flex-1 font-medium text-sm">
                    {task}
                  </p>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTask(index)}
                  >
                    Delete
                  </Button>
                </ListItem>
              ))}
            </ListItems>
          </ListGroup>
        </ListProvider>

      </div>
    </>
  );
}


//   return (
    // <div className="w-full max-w-md mx-auto mt-10 space-y-6">
    //    <div className="p-4">
    //   <ThemeToggle />
    //   <h1 className="text-3xl font-bold mt-4">Hello!</h1>
//     </div>
//       <Card>
//         <CardHeader>
//           <CardTitle>Add a Task</CardTitle>
//         </CardHeader>

//         <CardContent className="flex gap-2">
//           <Input
//             value={inputValue}
//             onChange={(e) => setInputValue(e.target.value)}
//             placeholder="Enter something..."
//             className="flex-1"
//           />

//           <Button onClick={handleAddTask}>
//             Add
//           </Button>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Your Tasks</CardTitle>
//         </CardHeader>

//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>#</TableHead>
//                 <TableHead>Task</TableHead>
//                 <TableHead>Action</TableHead>
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {tasks.map((task, index) => (
//                 <TableRow key={index}>
//                   <TableCell>{index + 1}</TableCell>
//                   <TableCell>{task}</TableCell>
//                   <TableCell>
//                     <Button
//                       variant="destructive"
//                       onClick={() => removeTask(index)}
//                     >
//                       Delete
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))}

//               {tasks.length === 0 && (
//                 <TableRow>
//                   <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
//                     No tasks yet.
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>

//     </div>
//   );
// }
