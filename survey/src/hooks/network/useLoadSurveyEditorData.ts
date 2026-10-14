import useRequest from 'ahooks/es/useRequest';

import useProjectRoute from '@/hooks/useProjectRoute';
import { getQuestionServices } from '@/services/question';
import useSurveyEditor from '@/store/hooks/useSurveyEditor';

const useLoadSurveyEditorData = () => {
  const {
    pathParams: { id = '' },
  } = useProjectRoute();
  const { resetEditorComponents, setPageInfo, setLoadingStatus } = useSurveyEditor();

  // 加载编辑器组件数据
  const { run: loadSurveyEditorData } = useRequest(
    async () => {
      return await getQuestionServices<SurveyDetailType>(id);
    },
    {
      ready: !!id,
      manual: true,
      onBefore: () => {
        setLoadingStatus(true);
      },
      onSuccess: ({ id, title, desc, js, css, isPublished, componentList }) => {
        let selectedId = '';
        if (componentList.length) {
          // 第一个组件默认选中
          selectedId = componentList[0].fe_id;
        }
        // 设置页面数据
        setPageInfo({ id, title, desc, js, css, isPublished });
        // 设置编辑器组件数据
        resetEditorComponents({
          selectedId,
          // 旧数据可能没有 visible 字段，默认显示，否则新建问卷的画布是空的
          editorComponentList: componentList.map((c) => ({
            ...c,
            id: c.fe_id,
            visible: c.visible ?? true,
          })),
          copiedComponent: null,
          activeComponent: null,
          isLoading: false,
        });
      },
      onFinally: () => setLoadingStatus(false),
    }
  );

  return {
    loadSurveyEditorData,
  };
};

export default useLoadSurveyEditorData;
