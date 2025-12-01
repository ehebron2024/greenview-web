import React from "react";
import { useParams } from "next/navigation";

const UserPage: React.FC = () => {
  const params = useParams();
  const userId = params?.userId;

  return (
    <div style={{ padding: "40px" }}>
      <h1>User Dashboard</h1>
      <p>
        Welcome! Your user ID is: <strong>{userId}</strong>
      </p>
      {/* You can fetch and display more user data here */}
    </div>
  );
};

export default UserPage;
