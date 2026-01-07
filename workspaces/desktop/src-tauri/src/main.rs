#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Emitter, EventTarget, Manager, WindowEvent};
use tauri_plugin_shell::{process::CommandEvent, ShellExt};

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .setup(|app| {
      let app_handle = app.handle().clone();

      // Hide until the server is ready
      if let Some(win) = app.get_webview_window("main") {
        let _ = win.hide();
      }

      // Spawn sidecar
      let cmd = app_handle
        .shell()
        .sidecar("my-sidecar")
        .expect("sidecar not found (check externalBin + name)");

      let (mut rx, _child) = cmd.spawn().expect("failed to spawn sidecar");

      tauri::async_runtime::spawn(async move {
        let mut ready = false;

        while let Some(event) = rx.recv().await {
          match event {
            CommandEvent::Stdout(line) => {
              let line = String::from_utf8_lossy(&line).to_string();
              println!("[sidecar] {}", line.trim_end());

              // Make your Node server print "READY" once it's listening.
              if !ready && line.contains("READY") {
                ready = true;

                if let Some(win) = app_handle.get_webview_window("main") {
                  let _ = win.show();
                  let _ = win.set_focus();
                }
              }
            }
            CommandEvent::Stderr(line) => {
              eprintln!("[sidecar stderr] {}", String::from_utf8_lossy(&line));
            }
            CommandEvent::Terminated(payload) => {
              eprintln!("[sidecar terminated] {payload:?}");
              break;
            }
            _ => {}
          }
        }
      });

      Ok(())
    })
    .on_window_event(|window, event| {
      if let WindowEvent::CloseRequested { .. } = event {
        // v2: no emit_all; emit to all targets like this:
        let _ = window
          .app_handle()
          .emit_to(EventTarget::any(), "app:closing", ());
      }
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
