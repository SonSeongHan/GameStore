import axios from 'axios';
import { getCookie } from './cookieUtil';

export const baseURL = 'http://localhost:8080';

const jwtAxios = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: 요청에 Authorization 헤더 추가
jwtAxios.interceptors.request.use(
  (config) => {
    const playerInfo = getCookie('player');

    if (playerInfo) {
      try {
        const parsedInfo =
          typeof playerInfo === 'string' ? JSON.parse(playerInfo) : playerInfo;

        if (parsedInfo.accessToken) {
          config.headers.Authorization = `Bearer ${parsedInfo.accessToken}`;
        } else {
          console.warn('No access token found in player info');
        }
      } catch (e) {
        console.error('Error parsing player info:', e);
      }
    } else {
      console.warn('No player info found in cookies');
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: 에러 처리
jwtAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 로그인 페이지로 리다이렉션
      window.location.href = '/player/login';
    }
    return Promise.reject(error);
  }
);

// JWT 디코딩 및 이메일 추출
export const decodeJWT = () => {
  const playerCookie = getCookie('player');
  if (!playerCookie) {
    console.warn('No player cookie found.');
    return null;
  }

  try {
    const parsedCookie =
      typeof playerCookie === 'string' ? JSON.parse(playerCookie) : playerCookie;

    const { accessToken } = parsedCookie;
    if (!accessToken) {
      console.warn('No access token found in player cookie.');
      return null;
    }

    // JWT 디코딩 및 이메일 추출
    const base64Url = accessToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return payload.email || null;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

export const decodeNicknameFromJWT = () => {
  const playerCookie = getCookie("player");
  if (!playerCookie) {
    console.warn("No player cookie found.");
    return null;
  }

  try {
    const parsedCookie =
      typeof playerCookie === "string" ? JSON.parse(playerCookie) : playerCookie;

    const { accessToken } = parsedCookie;
    if (!accessToken) {
      console.warn("No access token found in player cookie.");
      return null;
    }


    // JWT 디코딩
    const base64Url = accessToken.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = atob(base64);
    const payload = JSON.parse(
      decodeURIComponent(
        decodedPayload.split("").map((c) => {
          return "%" + c.charCodeAt(0).toString(16).padStart(2, "0");
        }).join("")
      )
    );

    return payload.nickname || null; // 닉네임 필드 추출
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
};


// JWT 디코딩 유틸리티 함수
export const decodedJWT = () => {
  const playerCookie = getCookie("player");
  if (!playerCookie) {
    console.warn("No player cookie found.");
    return null;
  }

  try {
    const parsedCookie =
      typeof playerCookie === "string" ? JSON.parse(playerCookie) : playerCookie;

    const { accessToken } = parsedCookie;
    if (!accessToken) {
      console.warn("No access token found in player cookie.");
      return null;
    }

    // JWT 디코딩
    const base64Url = accessToken.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    return {
      // email: payload.email || null,
      roleNames: payload.roleNames || null, // 역할 추가 반환
    };
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
};

export const saveEmailNicknamePair = (email, nickname) => {
  const mappings = JSON.parse(localStorage.getItem('emailNicknameMap') || '{}');
  mappings[email] = nickname;
  localStorage.setItem('emailNicknameMap', JSON.stringify(mappings));
};

export const getNicknameByEmail = (email) => {
  const mappings = JSON.parse(localStorage.getItem('emailNicknameMap') || '{}');
  return mappings[email];
};

export default jwtAxios;
