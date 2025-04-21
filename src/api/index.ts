// API 관련 모든 파일을 관리
// API 엔드포인트 및 공통 설정

//export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.example.com';

export const ENDPOINTS = {
  ESN: {
    TE: {
      SYNC: '/esn/app/te_sync',
      FONT_LIST: '/esn/app/font/filelist',
      FONT_DOWNLOAD: '/esn/app/font/download',
      FONT_UPLOAD: '/esn/app/font/upload',
      FONT_REMOVE: '/esn/app/font/remove',
      AUTH_USER: '/esn/app/auth_user',
      IMPORT_TE_DATA: '/esn/app/import_te_data',
      EXPORT_TE_DATA: '/esn/app/export_te_data',
      PREVIEW_TE_DATA: '/esn/app/preview_te_data'
    },
    USER: {
      LOGIN: '/user/login'
    },
    FILE: {
      SYNC: '/file/sync',
      DOWNLOAD: '/file/download',
      UPLOAD: '/file/upload',
      UPDATE: '/file/update',
      DELETE: '/file/delete',
      APPLY: '/file/apply'
    }
  },
  V1: {
    GET_USER: '/esl/system/get_user'
  },
  V2: {
    LOGIN: '/esl/service/v2/login',
    LOGOUT: '/esl/service/v2/logout',
    IMPORT_TE_DATA: '/esl/te/v2/query',
    EXPORT_TE_DATA: '/esl/te/v2/control',
    SYSTEM_INFO: '/esl/system/v2/info',
    HEARTBEAT: '/esl/service/v2/heartbeat',
    PREVIEW_TE: '/esl/template/v2/query_list',
    IMAGE: {
      QUERY: '/esl/image/v2/query_list',
      ADD: '/esl/image/v2/add',
      GET: '/esl/image/v2/get', 
      EDIT: '/esl/image/v2/edit',
      DELETE: '/esl/image/v2/delete'
    },
    TE: {
      GET_UPDATE: '/esl/te/v2/get_update',
      SET_UPDATE: '/esl/te/v2/set_update'
    },
    FONT: {
      UPLOAD: '/esl/font/v2/upload',
      DOWNLOAD: '/esl/font/v2/download',
      REMOVE: '/esl/font/v2/remove',
      LIST: '/esl/font/v2/filelist'
    },
    CORE: {
      RESTART: '/esl/core/v2/restart'
    }
  }
};