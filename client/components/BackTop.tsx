import classnames from "classnames";
import throttle from "lodash/throttle";
import { useEffect, useState } from "react";

export default () => {
  const [visible, setVisible] = useState(false);
  const goTop = () => {
    window.scrollTo(0, 0);
  };
  const handleScroll = (e: any) => {
    // 滚动高度 ==> 兼容多种浏览器
    const scrollTop =
      (e.srcElement ? e.srcElement.documentElement.scrollTop : false) ||
      window.pageYOffset ||
      (e.srcElement ? e.srcElement.body.scrollTop : 0);
    setVisible(scrollTop > 300);
  };
  useEffect(() => {
    const dScroll = throttle(handleScroll, 1000);
    window.addEventListener("scroll", dScroll);
    return () => {
      window.removeEventListener("scroll", dScroll);
    };
  }, []);
  return (
    <div
      onClick={goTop}
      className={classnames(
        "fixed right-10 bottom-10  bg-[#fff] rounded-full shadow-xl p-2 cursor-pointer transition-transform hover:-translate-y-2",
        {
          block: visible,
          hidden: !visible,
        }
      )}
    >
      <div>Back to top</div>
    </div>
  );
};
