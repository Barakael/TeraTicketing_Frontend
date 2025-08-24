import React from "react";
import { useTickets } from "../../contexts/TicketContext";
import Button from "../ui/Button";
import { toast } from "react-hot-toast";

const TicketMergeTest: React.FC = () => {
  const { mergeTickets, tickets } = useTickets();

  const testMerge = async () => {
    if (tickets.length < 2) {
      toast.error("Need at least 2 tickets to test merge");
      return;
    }

    const testTickets = tickets.slice(0, 2);
    console.log("Testing merge with tickets:", testTickets);

    try {
      const mergedTicketData = {
        title: `TEST MERGE: ${testTickets[0].title} + ${testTickets[1].title}`,
        description: `This is a test merge of tickets ${testTickets[0].id} and ${testTickets[1].id}`,
        priority: "high",
        status: "in_progress",
        department_id:
          testTickets[0].department?.id || testTickets[0].department,
        category_id: testTickets[0].category?.id || testTickets[0].category,
        assigned_to: testTickets[0].assignedTo?.id || testTickets[0].assignedTo,
      };

      await mergeTickets(
        testTickets.map((t) => t.id),
        mergedTicketData,
        "priority",
        []
      );

      toast.success("Test merge completed!");
    } catch (error) {
      console.error("Test merge failed:", error);
      toast.error("Test merge failed");
    }
  };

  return (
    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
      <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
        Merge Test Component
      </h3>
      <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
        This component helps test the merge functionality. It will merge the
        first 2 tickets in the list.
      </p>
      <Button onClick={testMerge} variant="outline" size="sm">
        Test Merge (First 2 Tickets)
      </Button>
      <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
        Available tickets: {tickets.length}
      </div>
    </div>
  );
};

export default TicketMergeTest;

