import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginPost } from "../api/PlayerApi";
import { getCookie, removeCookie, setCookie } from "../util/cookieUtil";

const initState = {
  email: "",
  user: { role: null }, // 초기 role 값 추가
};

const loadMemberCookie = () => {
  //쿠키에서 로그인 정보 로딩
  const memberInfo = getCookie("player");

  //닉네임 처리하여 사용자가 입력한 값중에 특수문자나 공백이 포함되면 디코딩하여 제대로 된 형태로 표시
  if (memberInfo && memberInfo.nickname) {
    memberInfo.nickname = decodeURIComponent(memberInfo.nickname);
  }
  return memberInfo;
};

export const loginPostAsync = createAsyncThunk("loginPostAsync", (param) => {
  return loginPost(param);
});

// slice: action과 reducer처리를 하는 함수
const loginSlice = createSlice({
  name: "LoginSlice",
  initialState: loadMemberCookie() || initState, // 쿠키가 없다면 초깃값 사용
  reducers: {
    login: (state, action) => {
      console.log("login....");

      // 소셜 로그인 회원이 사용
      const payload = action.payload;
      setCookie("player", JSON.stringify(payload), 1); // 1일

      return payload;
    },
    logout: (state, action) => {
      console.log("logout....");
      removeCookie("player");
      return { ...initState };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginPostAsync.fulfilled, (state, action) => {
        console.log("fulfilled"); //완료
        const payload = action.payload;

        // 정상적인 로그인시에만 저장
        if (!payload.error) {
          setCookie("player", JSON.stringify(payload), 1); //1일
          // setCookie("member", JSON.stringify(payload),1/24)  //시간
        }
        return payload;
      })
      .addCase(loginPostAsync.pending, (state, action) => {
        console.log("pending"); //처리중
      })
      .addCase(loginPostAsync.rejected, (state, action) => {
        console.log("rejected"); // 에러
      });
  },
});

export const { login, logout } = loginSlice.actions;
export default loginSlice.reducer;
