import { useState } from "react";
import {
  ClickAwayListener,
  Modal,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import { MdOutlineLogout } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { RiLockPasswordFill } from "react-icons/ri";
import ChangePasswordFormWrapper from "./ChangePassword/ChangePasswordFormWrapper";
import { showConfirmationDialog } from "../../../../utils/validations/showConfirmationDialog";
import { clearLocalStorage } from "../../../../utils/configs/authConfig";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../../redux/store";
import {
  setAccessToken,
  setRefreshToken,
  setUserAccess,
  setUserData,
} from "../../../../redux/slices/AuthSlice";

type UserProfileCardPropTypes = {
  onClickAway: () => void;
  userData: {
    name?: string;
    mobile?: string;
    email?: string;
    memberId?: string;
  };
};

const UserProfileCard = ({
  onClickAway,
  userData,
}: UserProfileCardPropTypes) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const isMobile = useMediaQuery("(max-width:1023px)");
  const [isOpenChangePasswordDialog, setIsOpenChangePasswordDialog] =
    useState<boolean>(false);

  const handleLogout = () => {
    showConfirmationDialog({
      title: "Confirm Logout",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      next: (result) => {
        if (result?.isConfirmed) {
          clearLocalStorage();
          dispatch(setAccessToken(null));
          dispatch(setRefreshToken(null));
          dispatch(setUserAccess(null));
          dispatch(setUserData(null));
          onClickAway();
          navigate("/");
        }
      },
    });
  };

  const handleOpenChangePassword = () => {
    setIsOpenChangePasswordDialog(true);
  };

  if (isMobile) {
    return (
      <>
        <Modal
          open
          onClose={onClickAway}
          aria-labelledby="mobile-profile-modal-title"
        >
          <div className="min-h-screen w-full flex items-center justify-center p-4 bg-black/35">
            <div className="w-full max-w-105">
              <div className="bg-[#f8f9fb] rounded-[30px] overflow-hidden border border-slate-300 shadow-2xl">
                <div
                  id="mobile-profile-modal-title"
                  className="text-center text-[34px] leading-10 font-semibold text-slate-700 py-4 border-b border-slate-300"
                >
                  Profile
                </div>

                <div className="px-8 py-5 border-b border-slate-300 flex items-center gap-4 bg-[#f8f9fb]">
                  <div className="w-11 h-11 flex justify-center items-center bg-(--primary-main) rounded-full text-white text-[22px]">
                    {userData?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <div className="text-slate-700 text-[14px] leading-4.5 font-semibold truncate">
                      {userData?.name || "Guest User"}
                    </div>
                    <div className="text-slate-500 text-[12px] leading-4 truncate">
                      {userData?.email || "No email found"}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full px-8 py-4 border-b border-slate-300 flex items-center gap-4 text-slate-600 hover:bg-slate-100"
                  onClick={handleOpenChangePassword}
                >
                  <RiLockPasswordFill className="text-[20px]" />
                  <span className="text-[14px] leading-5">Change Password</span>
                </button>

                <button
                  type="button"
                  className="w-full px-8 py-4 border-b border-slate-300 flex items-center gap-4 text-[#cf3f3f] hover:bg-rose-50"
                  onClick={handleLogout}
                >
                  <MdOutlineLogout className="text-[20px]" />
                  <span className="text-[14px] leading-5">Logout</span>
                </button>

                <button
                  type="button"
                  onClick={onClickAway}
                  className="w-full py-4 text-[16px] leading-5 text-[#1e88af] hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Modal>
        {isOpenChangePasswordDialog ? (
          <ChangePasswordFormWrapper
            onClose={() => setIsOpenChangePasswordDialog(false)}
          />
        ) : null}
      </>
    );
  }

  return (
    <ClickAwayListener onClickAway={onClickAway}>
      <div className="absolute top-11.5 right-0 w-72.5 shadow-lg rounded animate-[fade_0.5s_ease-in-out] z-[1000]">
        <div className="flex gap-3 items-center bg-slate-50 h-17.5 px-4 border-b border-slate-300">
          <div className="w-10.75 h-10.75 flex justify-center items-center bg-(--primary-main) rounded-full text-white border border-(--primary-border)">
            {userData?.name?.[0]?.toUpperCase() || "U"}
          </div>

          <div className="flex-1 overflow-auto">
            <div className="text-slate-700 font-medium">{userData?.name || "User"}</div>
            <Tooltip title={userData?.email || ""} className="bg-white">
              <div className="text-sm text-slate-500 text-ellipsis overflow-hidden">
                {userData?.email || ""}
              </div>
            </Tooltip>
          </div>
        </div>{" "}
        <div className="border-t border-slate-300 px-7 py-3 bg-white">
          <div className="flex gap-3 text-slate-500 items-center hover:text-(--primary-main) cursor-pointer">
            <RiLockPasswordFill className="text-xl" />
            <div
              className=""
              onClick={handleOpenChangePassword}
            >
              Change Password
            </div>
          </div>
        </div>
        {/* Change Password Dialog */}
        {isOpenChangePasswordDialog ? (
          <ChangePasswordFormWrapper
            onClose={() => setIsOpenChangePasswordDialog(false)}
          />
        ) : null}
        <div className="border-t border-slate-300 px-7 py-3 bg-white">
          <div className="flex gap-3 text-slate-500 items-center hover:text-(--primary-main) cursor-pointer">
            <MdOutlineLogout className="text-xl" />
            <div className="" onClick={handleLogout}>Logout</div>
          </div>
        </div>
      </div>
    </ClickAwayListener>
  );
};

export default UserProfileCard;
