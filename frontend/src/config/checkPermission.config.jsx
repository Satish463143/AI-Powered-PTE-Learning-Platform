import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMeQuery } from "../api/auth.api";
import Swal from "sweetalert2";
import "sweetalert2/src/sweetalert2.scss";

const CheckPermission = ({ allowedBy, children }) => {
  const { data: loggedInUser, isLoading } = useMeQuery();
  const navigate = useNavigate();

  // Use the correct user object
  const user = loggedInUser?.result || loggedInUser;

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // SKIP role check for now
        // if (allowedBy && user.role !== allowedBy) {
        //   Swal.fire({
        //     title: "Unauthorized",
        //     text: "You don't have permission to access this panel!!!",
        //     icon: "warning",
        //     confirmButtonText: "Go Home",
        //   }).then(() => navigate("/"));
        // }
      } else {
        Swal.fire({
          title: "Please Login First",
          text: "You need to be logged in to access this page",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Login",
          cancelButtonText: "Go Home",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/login");
          } else {
            navigate("/");
          }
        });
      }
    }
  }, [user, allowedBy, navigate, isLoading]);

  if (isLoading) return null;
  if (user) {
    return children;
  }
  return null;
};

export default CheckPermission; 