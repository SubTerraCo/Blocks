; =============================================================================
; BLOCKS - Custom NSIS Installer Script
; Provides Install, Uninstall, Modify, and Reinstall functionality
; =============================================================================

!macro customHeader
  ; Custom header with branding
  !define MUI_HEADERIMAGE
  !define MUI_HEADERIMAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Header\win.bmp"
!macroend

!macro preInit
  ; Pre-initialization - check for existing installation
  SetShellVarContext all
  
  ; Check if already installed
  ReadRegStr $0 SHCTX "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_GUID}" "InstallLocation"
  ${If} $0 != ""
    ; Application is already installed
    MessageBox MB_YESNO "Blocks is already installed at:$\n$0$\n$\nWould you like to modify or reinstall?" IDYES continue IDNO abort
    abort:
      Abort
    continue:
  ${EndIf}
!macroend

!macro customInstall
  ; Custom installation steps
  
  ; Create shortcuts in Start Menu
  CreateDirectory "$SMPROGRAMS\Blocks"
  CreateShortCut "$SMPROGRAMS\Blocks\Blocks.lnk" "$INSTDIR\Blocks.exe" "" "$INSTDIR\Blocks.exe" 0
  CreateShortCut "$SMPROGRAMS\Blocks\Uninstall Blocks.lnk" "$INSTDIR\Uninstall Blocks.exe" "" "$INSTDIR\Uninstall Blocks.exe" 0
  
  ; Register file associations (optional - for .blocks files if needed)
  ; WriteRegStr HKCR ".blocks" "" "Blocks.Document"
  ; WriteRegStr HKCR "Blocks.Document" "" "Blocks Task File"
  ; WriteRegStr HKCR "Blocks.Document\shell\open\command" "" '"$INSTDIR\Blocks.exe" "%1"'
  
  ; Write version info to registry for update checking
  WriteRegStr SHCTX "Software\Blocks" "Version" "${VERSION}"
  WriteRegStr SHCTX "Software\Blocks" "InstallPath" "$INSTDIR"
!macroend

!macro customUnInstall
  ; Custom uninstallation steps
  
  ; Remove shortcuts
  RMDir /r "$SMPROGRAMS\Blocks"
  
  ; Remove file associations (if added)
  ; DeleteRegKey HKCR ".blocks"
  ; DeleteRegKey HKCR "Blocks.Document"
  
  ; Ask about removing user data
  MessageBox MB_YESNO "Would you like to remove your Blocks user data (tasks, settings)?$\n$\nSelect 'No' to keep your data for future reinstallation." IDNO keepData
    ; Remove app data
    RMDir /r "$APPDATA\blocks-desktop"
    RMDir /r "$LOCALAPPDATA\blocks-desktop"
  keepData:
  
  ; Clean up registry
  DeleteRegKey SHCTX "Software\Blocks"
!macroend

!macro customRemoveFiles
  ; Remove all installed files
  RMDir /r "$INSTDIR"
!macroend

