::start start.bat
start others\run_node_server.bat
timeout 2
start firefox http://localhost:3000/prepare-starter-data
::rmdir /s /q %1
::del /f /q %2