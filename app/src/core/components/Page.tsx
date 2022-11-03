import { FC } from "react";
import { joinClasses } from "../../core/utils/classes";
import Footer from "./Layout/Footer";

interface Props {
  children: JSX.Element;
  className?: string;
  isFooter?: boolean;
}
export const Page: FC<Props> = ({ children, className = "", isFooter = true }) => {
  return (
    <>
      <div className="scrollbar-view">
        <div className={joinClasses("page-scrollbar-content", className)}>
          {children}
          {isFooter && <Footer />}
        </div>
      </div>
      <style>{`
      .page-scrollbar-content {
        display: block;
        min-height: 100%;
        flex-direction: column;
        width: 100%;
        height: 100%;
      }

      @media only screen and (min-width: 1430px) {
        .page-scrollbar-content {
          padding: 35px;
          padding-top: 20px;
          padding-left: 48px;
          padding-right: 48px;
        }
      }

      @media screen and (min-width: 1605px) {
        .page-scrollbar-content {
          padding-top: 20px;
          max-width: 1450px;
          margin-left: auto;
          margin-right: auto;
        }
      }

      .scrollbar-view {
        position: relative;
        overflow: scroll;
        overflow-x: hidden;
        display: flex;
        -webkit-box-flex: 1;
        flex-grow: 1;
        flex-direction: column;
      }
      `}</style>
    </>
  );
};
