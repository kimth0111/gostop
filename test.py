import sys
limit_number = 150000
sys.setrecursionlimit(limit_number)

H, W = map(int, input().split())
y1,x1,y2,x2 = map(int, input().split())
end = 0


mapInform = []
for k in range(H) :
  mapInform.append(list(input()))

no=[]
for kk in range(H) :
    li=[]
    for ll in range(W):
        li.append({"D":{"D":0,"S":0,"W":0,"A":0,"Q":0},"Q":{"D":0,"S":0,"W":0,"A":0,"Q":0},"W":{"D":0,"S":0,"W":0,"A":0,"Q":0},"S":{"D":0,"S":0,"W":0,"A":0,"Q":0},"A":{"D":0,"S":0,"W":0,"A":0,"Q":0}})
    no.append(li)

# print(no)
result = []
index = 0
newId = 0
def main(H,W,x1,y1,x2,y2,mapInform, type, arr, re, rli):  
  isAlready = []
  for aa in arr:
    isAlready.append(aa)
  a=[]
  global index
  global newId 
  global no
  index+=1
  # print(index)
#   print(no)
  if x1 == x2 and y1 == y2:
    # print("hihihi!!!")
    isAlready.append([y1,x1])
    result.append(isAlready)
    return [["complete", [x1,y1],re]]
  if type=="up":
      re = "W"
  elif type=="left":
      re = "A"
  elif type=="right":
      re = "D"
  elif type == "down":
      re = "S"
  if x1==5 and y1 ==3 and re == "W":  
        print(isOk(H,W,x1,y1,mapInform, isAlready,type, re), rli)
  if type=="ㅇ" or isOk(H,W,x1,y1,mapInform, isAlready,type, re):
    
    # print("hihi")
    isAlready.append([y1,x1])
    # print(isAlready)
    if type=="up":
      re = "W"
      rli+=re
      if(no[y1-1][x1-1][re]["A"] !=-1):
        a.append(main(H,W,x1-1,y1,x2,y2,mapInform,"left",isAlready, re,rli))
      if(no[y1-1][x1-1][re]["D"] !=-1):
        
        a.append(main(H,W,x1+1,y1,x2,y2,mapInform,"right",isAlready, re,rli))
        if x1==5 and y1 ==3 and re == "W" and rli == "QQDDSSAASSDDDDWW":
            print(a)
      if(no[y1-1][x1-1][re]["W"] !=-1):
        a.append(main(H,W,x1,y1-1,x2,y2,mapInform,"up",isAlready, re,rli))
    elif type=="left":
      re = "A"
      rli+=re
      if(no[y1-1][x1-1][re]["A"] !=-1):
        a.append(main(H,W,x1-1,y1,x2,y2,mapInform,"left",isAlready, re,rli))
      if(no[y1-1][x1-1][re]["S"] !=-1):
        a.append(main(H,W,x1,y1+1,x2,y2,mapInform,"down",isAlready, re,rli))
      if(no[y1-1][x1-1][re]["W"] !=-1):
        a.append(main(H,W,x1,y1-1,x2,y2,mapInform,"up",isAlready, re,rli))
    elif type=="right":
      re = "D"
      rli+=re
      if(no[y1-1][x1-1][re]["S"] !=-1):
        a.append(main(H,W,x1,y1+1,x2,y2,mapInform,"down",isAlready, re,rli))
      if(no[y1-1][x1-1][re]["D"] !=-1):
        a.append(main(H,W,x1+1,y1,x2,y2,mapInform,"right",isAlready, re,rli))
        
      if(no[y1-1][x1-1][re]["W"] !=-1):
        
        a.append(main(H,W,x1,y1-1,x2,y2,mapInform,"up",isAlready, re,rli))
        
    elif type == "down":
      re = "S"
      rli+=re
      if(no[y1-1][x1-1][re]["A"] !=-1):
        a.append(main(H,W,x1-1,y1,x2,y2,mapInform,"left",isAlready, re,rli))
      if(no[y1-1][x1-1][re]["D"] !=-1):
        a.append(main(H,W,x1+1,y1,x2,y2,mapInform,"right",isAlready, re,rli))
      if(no[y1-1][x1-1][re]["S"] !=-1):
        a.append(main(H,W,x1,y1+1,x2,y2,mapInform,"down",isAlready, re,rli))
    else :
      a= [main(H,W,x1,y1-1,x2,y2,mapInform,"up",isAlready, re,rli)]
  else:
    
    # print("byebye", re)
    if(isOk2(x1,y1,isAlready)):
        return [["fuck",[x1,y1],re]]
    return [["m",[x1,y1],re]]

  ac =[] 
  
#   else:
#     no[re]=[]
#     no[re].append([x1,y1])
  return ac
def isOk2(x,y,isAlready):
    for i in isAlready:
        if i[0] == y and i[1] == x:
            return False
    return True
def isOk(H,W,x,y,mapInform, isAlready,type,re):
#   input()
  global no
#   print(no)
  # if y==4 and x == 1:
  #   print(isAlready, type)
  #   print(y,x)
  # input()
  
  if x <= 0 or y <= 0 or x > W or y > H:
    return False
#   for f in no:
#     if f == re:
#         print("hihi")
#         return False
  
  
  
  for i in isAlready:
    if i[0] == y and i[1] == x:
    #   print("이미 탐색함")
      return False
  if mapInform[y-1][x-1] == '#':
    return False
  return True


a=main(H,W,x1,y1,x2,y2,mapInform,"ㅇ",[],"Q","QQ")


r =""
last=""
lastDr = 0
for re in result :
  
  dR =0
  tempX = -10
  tempY = -10
  for i in re:
    x = i[1]
    y= i[0]
    b= r[-1:]
    if x == tempX+1 :
      if b == "W" or b == "S" :
        dR+=1
      r += "D"
    elif x == tempX - 1:
      
      if b == "W" or b == "S" :
        dR+=1
      r += "A"
    elif y == tempY - 1:
      
      if b == "D" or b == "A" :
        dR+=1
      r += "W"
    elif y == tempY + 1:
      
      if b == "D" or b == "A" :
        dR+=1
      r += "S"
    tempX = x
    tempY = y
  if dR >= lastDr:
    lastDr = dR
    last = r
  r=""
# print(r)
print(lastDr)
print(last)
print(no)