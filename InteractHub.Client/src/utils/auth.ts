// import { jwtDecode } from "jwt-decode";

// type TokenType = {
//     role: string;
//     exp: number;
// };

export const getToken = () => {
    return localStorage.getItem("interact_hub_token");
};

export const isLoggedIn = () => {
    return !!getToken();
};