import React, { createContext, useContext, useState } from 'react';
import p5Types from 'p5';

import { useConfigReducer } from '@reducers/ConfigReducer';
import { useWorldReducer } from '@reducers/WorldReducer';

export const AppContext = createContext<Record<string, any>>({});

type Props = React.PropsWithChildren<{}>;

export const AppContextProvider : React.FC<Props> = ({ children }) => {
    const p5Instance = useState<p5Types>();

    const ctxServices = {
        configReducer: useConfigReducer(),
        worldReducer: useWorldReducer(),
        p5Instance: p5Instance,
    };

    return (
        <AppContext.Provider value={ctxServices}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
