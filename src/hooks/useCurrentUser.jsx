import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";


export const useCurrentUser = () => {
  const axiosSecure = useAxiosSecure();
  const token = localStorage.getItem("authToken");

  const fetchCurrentUser = async () => {
    const res = await axiosSecure.get("/users/me");
    return res.data;
  };

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
    enabled: !!token,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
};
