"use client";

import { PlusCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import UpsertExamForm from "./upsert-exam-form";

const AddExamButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Button size="sm" className="h-8 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Adicionar Exame
          </span>
        </Button>
      </DialogTrigger>
      <UpsertExamForm onSuccess={() => setIsOpen(false)} isOpen={isOpen} />
    </Dialog>
  );
};

export default AddExamButton;
