Luồng hoạt động của Game

    1. Khởi tạo và Reset Game:
    Khi trò chơi bắt đầu hoặc được reset, các biến trạng thái của trò chơi như tọa độ của nhân vật, điểm số, các vật cản và cây sẽ được thiết lập lại.
    Một platform ban đầu và một cây sẽ được tạo để bắt đầu trò chơi.

    2. Sự Kiện Nhấp Chuột hoặc Nhấn Phím:
    Khi người chơi nhấp chuột hoặc nhấn phím, nhân vật sẽ bắt đầu căng dãy gậy.
    Việc giữ chuột hoặc phím sẽ kéo dãy gậy ra xa hơn.
    Sự Kiện Nhả Chuột hoặc Thả Phím:

    3. Khi người chơi nhả chuột hoặc thả phím, gậy sẽ ngừng căng và bắt đầu quay lại.
    Góc quay của gậy sẽ được tính toán dựa trên thời gian căng và tốc độ quay đã định trước.
    Kiểm Tra Gậy và Vật Cản:

    4. Khi gậy đã quay đến một góc nhất định, trò chơi sẽ kiểm tra xem gậy có chạm vào vật cản không.
    Nếu gậy chạm vào vật cản, người chơi sẽ nhận điểm tùy thuộc vào việc gậy chạm vào vị trí hoàn hảo của vật cản hay không.
    Sau đó, một platform mới và một cây mới sẽ được tạo ra.
    Di Chuyển Nhân Vật và Cập Nhật Điểm Số:

    5. Nếu gậy không chạm vào vật cản, nhân vật sẽ tiếp tục di chuyển về phía trước.
    Điểm số của người chơi sẽ được cập nhật dựa trên việc vượt qua vật cản và việc chạm vào vị trí hoàn hảo của nó.
    Kiểm Tra Kết Thúc Trò Chơi:

    6. Nếu nhân vật vượt quá vùng an toàn hoặc không thể vượt qua vật cản, trò chơi sẽ kết thúc.
    Âm thanh "death" sẽ được phát và nút restart sẽ xuất hiện để cho phép người chơi chơi lại.

    7.Vẽ Đồ Họa và Cập Nhật Màn Hình:
    Mỗi lần vòng lặp chính chạy, các phần tử đồ họa như nhân vật, gậy, vật cản và nền sẽ được vẽ lại dựa trên trạng thái hiện tại của trò chơi.

    8. Lặp Lại quá trình:
    Quá trình trên sẽ được lặp lại liên tục, tạo ra một trò chơi có chức năng liên tục và tương tác với người chơi.

Biến:
    1. phase:
    Chức năng: Biến này lưu trữ trạng thái hiện tại của trò chơi, xác định hành động tiếp theo của người chơi và cách mà các phần tử trong trò chơi sẽ phản ứng.
    Giá trị có thể:
    "waiting": Khi người chơi chưa bắt đầu hoặc đang chờ để bắt đầu.
    "stretching": Khi người chơi đang căng gậy.
    "turning": Khi gậy đã được kéo dài xong và sẽ rơi xuống vật cản.
    "walking": Khi nhân vật đang di chuyển trên các vật cản.
    "transitioning": Khi nhân vật di chuyển từ vật cản này sang vật cản khác.
    "falling": Khi nhân vật rơi xuống do không vượt qua được vật cản.

    2. lastTimestamp:
    Chức năng: Biến này lưu trữ thời điểm gần nhất mà hàm requestAnimationFrame đã được gọi, được sử dụng để tính toán thời gian giữa các frame.

    3. heroX, heroY:
    Chức năng: Lưu trữ tọa độ của nhân vật trên màn hình, điều này quyết định vị trí hiển thị của nhân vật.

    4.sceneOffset:
    Chức năng: Điều chỉnh sự di chuyển của khung cảnh trò chơi, tạo ra hiệu ứng di chuyển của màn hình theo nhân vật.

    5.platforms, sticks, trees:
    Chức năng: Các mảng này lưu trữ thông tin về các vật cản, gậy và cây trong trò chơi, bao gồm vị trí và kích thước của chúng.

    6.score:
    Chức năng: Biến này lưu trữ điểm số của người chơi trong trò chơi, được tăng khi người chơi vượt qua các vật cản.

Hàm:
    1.resetGame():
    Chức năng: Khởi tạo hoặc reset lại trạng thái của trò chơi, bao gồm việc cài đặt lại điểm số, vị trí của nhân vật và các vật cản.

    2.generateTree(), generatePlatform():
    Chức năng: Tạo ra các cây mới hoặc các vật cản mới trong trò chơi với các thuộc tính ngẫu nhiên.

    3.animate(timestamp):
    Chức năng: Hàm chính của trò chơi, cập nhật trạng thái của trò chơi và vẽ lại màn hình trong mỗi frame.

    4.draw():
    Chức năng: Vẽ các phần tử đồ họa của trò chơi như nền, nhân vật, vật cản và gậy.

    5.thePlatformTheStickHits():
    Chức năng: Kiểm tra xem gậy có va chạm vào vật cản không và trả về vật cản mà gậy va chạm.

    6.Các hàm vẽ (drawPlatforms(), drawHero(), drawSticks(), drawBackground(), drawHill(), drawTree()):
    Chức năng: Vẽ các phần tử đồ họa cụ thể của trò chơi như các vật cản, nhân vật, gậy, cây và nền.

    7.getHillY(), getTreeY():
    Chức năng: Tính toán vị trí của các đối tượng như ngọn đồi và cây theo trục Y, dựa vào vị trí trên trục X và các tham số khác.