import { useSession } from "next-auth/react";
import { ReactNode, cloneElement, isValidElement, ReactElement } from "react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { Spin, Button, Input } from "antd"; // Import Button and Input for type checking

interface RoleProtectedProps {
  allowedRoles: string[];
  actionType: "add" | "edit" | "delete"; // Specify the action type (add, edit, delete)
  createdAt?: string; // Pass created_at from the record for supervisor logic
  children: ReactNode | ((props: { disabled: boolean }) => ReactNode); // Updated children type to accept a function
}

// Extend this type to any component that accepts the "disabled" prop
interface Disableable {
  disabled?: boolean;
}

// Helper to check if a component accepts a "disabled" prop
const hasDisabledProp = (element: any): element is ReactElement<Disableable> => {
  return (
    element?.type === Button || // Check if it's a Button
    element?.type === Input // Check if it's an Input or other component that accepts disabled
  );
};

const RoleProtected = ({ allowedRoles, actionType, createdAt, children }: RoleProtectedProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <Spin />;
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const userRole = session?.user?.role ?? ""; // Provide default empty string if role is undefined
  const editableUntil = session?.user?.editable_until ?? 0; // Get editable_until from session (in days)
  const isSupervisor = userRole === "supervisor";
  const isReporter = userRole === "reporter";
  const isFinance = userRole === "finance";
  let disabled = false;

  // Default: disable if user doesn't have the correct role
  if (!allowedRoles.includes(userRole)) {
    disabled = true; // Disable the component for unauthorized roles, but don't hide it
  }

  // Handle specific actions based on role and createdAt for supervisors
  switch (actionType) {
    case "edit":
      if ((isSupervisor || isFinance) && createdAt) {
        const createdAtDate = dayjs(createdAt);
        const editDeadline = createdAtDate.add(editableUntil, "day");
        const now = dayjs();

        if (now.isAfter(editDeadline)) {
          disabled = true; // Disable edit button after the editable_until days have passed
        }
      }
      if (isReporter || isFinance) {
        disabled = true; // Reporters or Finance cannot edit
      }
      break;
    case "delete":
      if (isSupervisor || isReporter) {
        disabled = true; // Supervisors and reporters cannot delete
      }
      break;
    default:
      break;
  }

  // If children is a function (render prop), call it with the `disabled` state
  if (typeof children === "function") {
    return <>{children({ disabled })}</>;
  }

  // Clone the child components and pass `disabled` prop if necessary
  const childrenWithProps = isValidElement(children) && hasDisabledProp(children)
    ? cloneElement(children, { disabled })
    : children;

  return <>{childrenWithProps}</>;
};

export default RoleProtected;
