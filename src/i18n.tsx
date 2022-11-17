import React, { useCallback } from 'react';
import intl from 'react-intl-universal';
import Cookie from 'js-cookie';
export const i18nStore = {
  currentLocale: 'EN-US',
  intl,
  updateI18n: (_: string) => {},
  initI18n: (currentLocale, locales) => {
    Cookie.set('lang', currentLocale);
    intl.init({
      currentLocale,
      locales,
    });
    i18nStore.currentLocale = currentLocale;
    i18nStore.intl = intl;
  },
};

const i18nRef = { current: i18nStore };

export const getI18n = (scope?: string) => {
  if (!scope) {
    return i18nRef.current;
  }
  return {
    ...i18nRef.current,
    intl: {
      ...i18nRef.current.intl,
      get: (key: string, options?: Record<string, any>) => {
        return i18nRef.current.intl.get(`${scope}.${key}`, options);
      },
      getHTML: (key: string, options?: Record<string, any>) => {
        return i18nRef.current.intl.getHTML(`${scope}.${key}`, options);
      }
    }
  }
};

export const I18nContext = React.createContext(i18nStore);

export interface II18nContextProps {
  children: React.ReactNode;
  locales: any;
  updateI18n?: (locale: string) => unknown,
}

export const I18nProvider = (props: II18nContextProps) => {
  const { children, updateI18n, locales } = props;
  const [state, setState] = React.useState({
    ...i18nStore,
    updateI18n,
  });
  const _updateI18n = useCallback((currentLocale: string) => {
    Cookie.set('lang', currentLocale);
    intl.init({
      currentLocale,
      locales,
    });
    setState(prev => ({
      ...prev,
      currentLocale,
      intl,
    }));
    updateI18n?.(currentLocale);
    
    i18nRef.current = {
      initI18n: state.initI18n,
      intl,
      currentLocale,
      updateI18n: _updateI18n
    };
  }, []);
  return (
    <I18nContext.Provider value={{
      ...state,
      updateI18n: _updateI18n,
    }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n(scope?: string) {
  const i18n = React.useContext(I18nContext);
  if(!scope) {
    return i18n;
  }
  return {
    ...i18n,
    intl: {
      ...i18n.intl,
      get: (key: string, options?: Record<string, any>) => {
        return i18n.intl.get(`${scope}.${key}`, options);
      },
      getHTML: (key: string, options?: Record<string, any>) => {
        return i18n.intl.getHTML(`${scope}.${key}`, options);
      }
    }
  };
}

export const Translation = (props: { children: (_intl: typeof intl) => React.ReactNode, scope?: string }) => {
  const { children, scope } = props;
  const { intl } = useI18n(scope);
  return <>{children(intl)}</>;
};