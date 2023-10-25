// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};
fn main() {
    //Project Menu
    let project_create: CustomMenuItem =
        CustomMenuItem::new("projectnew", "Project Create").accelerator("Alt+C");
    let project_open = CustomMenuItem::new("projectopen", "Project Open...").accelerator("Alt+P");
    let menu_project = Submenu::new(
        "Project",
        Menu::new().add_item(project_create).add_item(project_open),
    );
    //File menu
    let file_open = CustomMenuItem::new("fileopen", "File Open...").accelerator("Ctrl + N");
    let file_save = CustomMenuItem::new("filesave", "File Save").accelerator("Ctrl + S");
    let file_save_as =
        CustomMenuItem::new("filesaveas", "File Save As...").accelerator("Ctrl + Shift + S");
    let file_menu = Submenu::new(
        "File",
        Menu::new()
            .add_submenu(menu_project)
            .add_native_item(MenuItem::Separator)
            .add_item(file_open)
            .add_item(file_save)
            .add_item(file_save_as)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Quit),
    );
    //Edit menu
    let undo: CustomMenuItem = CustomMenuItem::new("undo", "Undo").accelerator("Ctrl + Z");
    let redo = CustomMenuItem::new("redo", "Redo").accelerator("Ctrl + Y");
    let edit_menu = Submenu::new(
        "Edit",
        Menu::new()
            .add_item(undo)
            .add_item(redo)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Cut)
            .add_native_item(MenuItem::Copy)
            .add_native_item(MenuItem::Paste),
    );

    let menu = Menu::new().add_submenu(file_menu).add_submenu(edit_menu);

    tauri::Builder::default()
        .menu(menu)
        .on_menu_event(|event| match event.menu_item_id() {
            "fileopen" => {
                println!("File_Open :: {:?}", event.menu_item_id());
            }
            "filesave" => {
                println!("FileSave :: {:?}", event.menu_item_id());
            }
            _ => {
                println!("未実装 :: {:?}", event.menu_item_id());
            }
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
