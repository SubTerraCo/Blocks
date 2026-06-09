; Blocks NSIS hooks — terminate running instances before install/uninstall.
; electron-builder loads this via nsis.include (relative to buildResources).

!macro customInit
  nsExec::ExecToLog 'taskkill /F /IM Blocks.exe /T'
  Sleep 1000
!macroend

!macro customInstall
  nsExec::ExecToLog 'taskkill /F /IM Blocks.exe /T'
  Sleep 500
!macroend

!macro customUnInstall
  nsExec::ExecToLog 'taskkill /F /IM Blocks.exe /T'
  Sleep 1000
!macroend
