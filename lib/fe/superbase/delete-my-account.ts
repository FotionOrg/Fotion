"use client";
export const deleteMyAccount = async (): Promise<boolean> => {
  const response = await fetch("/api/user/profile", {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete account");
  }
  return true;
};
