$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$userDataDir = Join-Path $env:TEMP "edge_cdp_profile_$(Get-Random)"

$process = Start-Process -FilePath $edgePath -ArgumentList "--headless=new", "--remote-debugging-port=9222", "--user-data-dir=`"$userDataDir`"", "http://localhost:8080/reservar.html" -PassThru

Start-Sleep -Seconds 4

try {
    $tabsJson = Invoke-RestMethod -Uri "http://localhost:9222/json"
    $pageTab = $tabsJson | Where-Object { $_.type -eq "page" -and $_.url -like "*reservar.html*" } | Select-Object -First 1

    if (-not $pageTab) {
        $pageTab = $tabsJson[0]
    }

    Write-Host "Page tab URL: $($pageTab.url)"
    Write-Host "WS URL: $($pageTab.webSocketDebuggerUrl)"

    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $cts = New-Object System.Threading.CancellationTokenSource
    $ws.ConnectAsync([Uri]$pageTab.webSocketDebuggerUrl, $cts.Token).Wait()

    function Send-CDP($ws, $id, $method, $params = @{}) {
        $msg = @{ id = $id; method = $method; params = $params } | ConvertTo-Json -Depth 10 -Compress
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($msg)
        $segment = [ArraySegment[byte]]::new($bytes)
        $ws.SendAsync($segment, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [System.Threading.CancellationToken]::None).GetAwaiter().GetResult()
    }

    function Receive-CDP($ws) {
        $buffer = New-Object byte[] 65536
        $segment = [ArraySegment[byte]]::new($buffer)
        $task = $ws.ReceiveAsync($segment, [System.Threading.CancellationToken]::None)
        $task.Wait(1000) | Out-Null
        if ($task.IsCompleted -and -not $task.IsFaulted) {
            $count = $task.Result.Count
            if ($count -gt 0) {
                return [System.Text.Encoding]::UTF8.GetString($buffer, 0, $count)
            }
        }
        return $null
    }

    # Enable domains
    Send-CDP $ws 1 "Console.enable"
    Send-CDP $ws 2 "Runtime.enable"
    Send-CDP $ws 3 "Log.enable"

    Start-Sleep -Seconds 2

    # Check for console messages / errors
    Send-CDP $ws 4 "Runtime.evaluate" @{
        expression = @"
            (function() {
                const logs = [];
                const serviceCards = document.querySelectorAll('.service-card');
                const state = window.bookingState;
                return {
                    serviceCardsCount: serviceCards.length,
                    hasBookingState: !!state,
                    hasSelectService: typeof window.selectService === 'function',
                    hasSelectProfessional: typeof window.selectProfessional === 'function',
                    initialSelectedService: state ? state.selectedService : null
                };
            })()
"@
        returnByValue = $true
    }

    Start-Sleep -Seconds 1
    for ($i=0; $i -lt 5; $i++) {
        $res = Receive-CDP $ws
        if ($res) { Write-Host "CDP Res: $res" }
    }

    # Click first service card
    Send-CDP $ws 5 "Runtime.evaluate" @{
        expression = @"
            (function() {
                const card = document.querySelector('.service-card');
                if (!card) return 'NO_CARD';
                card.click();
                return {
                    clickedCardText: card.innerText.replace(/\s+/g, ' '),
                    selectedServiceAfterClick: window.bookingState ? window.bookingState.selectedService : null,
                    selectedStep: window.bookingState ? window.bookingState.currentStep : null
                };
            })()
"@
        returnByValue = $true
    }

    Start-Sleep -Seconds 1
    for ($i=0; $i -lt 5; $i++) {
        $res = Receive-CDP $ws
        if ($res) { Write-Host "CDP Res (After Click): $res" }
    }

    # Click second service card
    Send-CDP $ws 6 "Runtime.evaluate" @{
        expression = @"
            (function() {
                const cards = document.querySelectorAll('.service-card');
                if (cards.length < 2) return 'NO_CARD_2';
                cards[1].click();
                return {
                    clickedCard2Text: cards[1].innerText.replace(/\s+/g, ' '),
                    selectedServiceAfterClick2: window.bookingState ? window.bookingState.selectedService : null
                };
            })()
"@
        returnByValue = $true
    }

    Start-Sleep -Seconds 1
    for ($i=0; $i -lt 5; $i++) {
        $res = Receive-CDP $ws
        if ($res) { Write-Host "CDP Res (After Click 2): $res" }
    }

    # Click a professional card
    Send-CDP $ws 7 "Runtime.evaluate" @{
        expression = @"
            (function() {
                const barbers = document.querySelectorAll('.barber-card');
                if (barbers.length === 0) return 'NO_BARBER_CARD';
                barbers[1].click(); // Click Darío
                return {
                    barberCardsCount: barbers.length,
                    selectedBarberAfterClick: window.bookingState ? window.bookingState.selectedBarber : null
                };
            })()
"@
        returnByValue = $true
    }

    Start-Sleep -Seconds 1
    for ($i=0; $i -lt 5; $i++) {
        $res = Receive-CDP $ws
        if ($res) { Write-Host "CDP Res (After Barber Click): $res" }
    }

    $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "Done", $cts.Token).Wait()

} finally {
    if (-not $process.HasExited) {
        Stop-Process -Id $process.Id -Force
    }
}
